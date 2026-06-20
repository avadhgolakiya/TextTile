<?php

namespace App\Routes;

use App\Db;
use App\Lib\Auth;
use App\Lib\IpTracker;
use App\Lib\Activity;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

class AuthRoutes
{
    public static function setup(RouteCollectorProxy $group): void
    {
        $group->post('/register', function (Request $request, Response $response) {
            $body = $request->getParsedBody();
            $name = $body['name'] ?? null;
            $password = $body['password'] ?? null;
            $mobile = $body['mobile'] ?? null;
            $gstin = $body['gstin'] ?? null;
            $businessName = $body['businessName'] ?? null;
            $address = $body['address'] ?? null;

            if (!$name || !$password || !$mobile || !$gstin || !$businessName || !$address) {
                $response->getBody()->write(json_encode(['error' => 'name, password, mobile, address, gstin, and businessName are required']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $phoneNum = trim((string)$mobile);
            $hash = password_hash(trim((string)$password), PASSWORD_BCRYPT);

            $usersColl = Db::getCollection('users');
            $existing = $usersColl->findOne(['phone' => $phoneNum]);
            if ($existing) {
                $response->getBody()->write(json_encode(['error' => 'An account already exists with this mobile number.']));
                return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
            }

            $doc = [
                'name' => trim((string)$name),
                'email' => "buyer-{$phoneNum}@system.local",
                'passwordHash' => $hash,
                'phone' => $phoneNum,
                'gstin' => strtoupper(trim((string)$gstin)),
                'businessName' => trim((string)$businessName),
                'address' => trim((string)$address),
                'isAdmin' => false,
                'createdAt' => new UTCDateTime()
            ];

            $result = $usersColl->insertOne($doc);
            $doc['_id'] = $result->getInsertedId();

            $accessToken = Auth::signToken((string)$doc['_id']);
            $response->getBody()->write(json_encode([
                'accessToken' => $accessToken,
                'user' => Auth::mapUser($doc)
            ]));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        });

        $group->post('/login', function (Request $request, Response $response) {
            $body = $request->getParsedBody();
            $identifier = $body['identifier'] ?? null;
            $password = $body['password'] ?? null;

            if (!$identifier || !$password) {
                $response->getBody()->write(json_encode(['error' => 'identifier and password are required']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $idStr = trim((string)$identifier);
            $usersColl = Db::getCollection('users');

            $userDoc = $usersColl->findOne([
                '$or' => [
                    ['email' => strtolower($idStr)],
                    ['phone' => $idStr]
                ]
            ]);

            if (!$userDoc) {
                $response->getBody()->write(json_encode(['error' => 'No account found.']));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            $ip = IpTracker::getClientIp($request);
            if (!empty($userDoc['isBlocked'])) {
                IpTracker::trackUserIp((string)$userDoc['_id'], $ip, 'login_attempt');
                $response->getBody()->write(json_encode(['error' => 'Your account has been blocked. Please contact support.']));
                return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
            }

            if (!password_verify(trim((string)$password), $userDoc['passwordHash'])) {
                $response->getBody()->write(json_encode(['error' => 'Incorrect password.']));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            $accessToken = Auth::signToken((string)$userDoc['_id']);
            $response->getBody()->write(json_encode([
                'accessToken' => $accessToken,
                'user' => Auth::mapUser($userDoc)
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        // Protected routes
        $group->group('', function (RouteCollectorProxy $protected) {

            $protected->get('/me', function (Request $request, Response $response) {
                $userId = $request->getAttribute('userId');
                $usersColl = Db::getCollection('users');
                $userDoc = $usersColl->findOne(['_id' => new ObjectId($userId)]);
                if (!$userDoc) {
                    $response->getBody()->write(json_encode(['error' => 'User not found']));
                    return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
                }
                $response->getBody()->write(json_encode(['user' => Auth::mapUser($userDoc)]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->patch('/me/address', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $address = $body['address'] ?? null;
                if (!$address || !is_string($address)) {
                    $response->getBody()->write(json_encode(['error' => 'Valid address is required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $userId = $request->getAttribute('userId');
                Db::getCollection('users')->updateOne(
                    ['_id' => new ObjectId($userId)],
                    ['$set' => ['address' => trim($address), 'updatedAt' => new UTCDateTime()]]
                );
                
                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->get('/buyers', function (Request $request, Response $response) {
                $usersColl = Db::getCollection('users');
                $ordersColl = Db::getCollection('orders');
                
                $docs = $usersColl->find(['isAdmin' => ['$ne' => true]])->toArray();
                $buyers = [];
                
                foreach ($docs as $user) {
                    $orderCount = $ordersColl->countDocuments(['buyerId' => (string)$user['_id']]);
                    $buyers[] = [
                        'id' => (string)$user['_id'],
                        'name' => $user['businessName'] ?? '',
                        'email' => $user['email'] ?? null,
                        'phone' => $user['phone'] ?? 'No phone',
                        'orders' => $orderCount,
                        'isBlocked' => $user['isBlocked'] ?? false,
                    ];
                }

                $response->getBody()->write(json_encode(['buyers' => $buyers]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->patch('/buyers/{id}/block', function (Request $request, Response $response, array $args) {
                $body = $request->getParsedBody();
                if (!isset($body['isBlocked']) || !is_bool($body['isBlocked'])) {
                    $response->getBody()->write(json_encode(['error' => 'isBlocked boolean is required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }
                
                $isBlocked = $body['isBlocked'];
                $userId = $request->getAttribute('userId');
                $targetId = $args['id'];
                
                $usersColl = Db::getCollection('users');
                $adminDoc = $usersColl->findOne(['_id' => new ObjectId($userId)]);
                
                if (!$adminDoc || empty($adminDoc['isAdmin'])) {
                    $response->getBody()->write(json_encode(['error' => 'Forbidden']));
                    return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
                }

                $updateObj = ['isBlocked' => $isBlocked, 'updatedAt' => new UTCDateTime()];
                if ($isBlocked) {
                    $updateObj['blockedAt'] = new UTCDateTime();
                    
                    $userIpLogColl = Db::getCollection('user_ip_log');
                    $blockedIpsColl = Db::getCollection('blocked_user_ips');
                    $knownIps = $userIpLogColl->find(['userId' => $targetId])->toArray();
                    
                    if (!empty($knownIps)) {
                        // Bulk write in PHP MongoDB driver
                        // Not strictly required to use bulkWrite if looping is fine, but it's more efficient
                        foreach ($knownIps as $log) {
                            $blockedIpsColl->updateOne(
                                ['ipAddress' => $log['ipAddress'], 'userId' => $targetId],
                                ['$set' => [
                                    'userId' => $targetId,
                                    'ipAddress' => $log['ipAddress'],
                                    'auto_detected' => true,
                                    'detectedAt' => new UTCDateTime(),
                                    'source' => $log['source'] ?? null
                                ]],
                                ['upsert' => true]
                            );
                        }
                    }
                } else {
                    $blockedIpsColl = Db::getCollection('blocked_user_ips');
                    $blockedIpsColl->deleteMany(['userId' => $targetId]);
                }

                $usersColl->updateOne(['_id' => new ObjectId($targetId)], ['$set' => $updateObj]);
                
                Activity::logActivity($request, $isBlocked ? 'blocked_user' : 'unblocked_user', ['targetId' => $targetId]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->post('/admins', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $email = $body['email'] ?? null;
                $password = $body['password'] ?? null;
                $name = $body['name'] ?? null;

                if (!$email || !$password || !$name) {
                    $response->getBody()->write(json_encode(['error' => 'Email, password, and name required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $userId = $request->getAttribute('userId');
                $usersColl = Db::getCollection('users');
                $caller = $usersColl->findOne(['_id' => new ObjectId($userId)]);

                if (!$caller || ($caller['email'] ?? '') !== 'admin@example.com') {
                    $response->getBody()->write(json_encode(['error' => 'Super Admin access required.']));
                    return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
                }

                $em = strtolower(trim((string)$email));
                if ($usersColl->findOne(['email' => $em])) {
                    $response->getBody()->write(json_encode(['error' => 'Account already exists for this email.']));
                    return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
                }

                $doc = [
                    'name' => trim((string)$name),
                    'email' => $em,
                    'passwordHash' => password_hash(trim((string)$password), PASSWORD_BCRYPT),
                    'phone' => null,
                    'gstin' => null,
                    'businessName' => 'System Admin',
                    'address' => null,
                    'isAdmin' => true,
                    'createdAt' => new UTCDateTime()
                ];

                $result = $usersColl->insertOne($doc);
                $newId = (string)$result->getInsertedId();

                Activity::logActivity($request, 'created_admin', ['newAdminEmail' => $em, 'newAdminId' => $newId]);

                $response->getBody()->write(json_encode([
                    'ok' => true, 
                    'admin' => ['id' => $newId, 'email' => $em, 'name' => $doc['name']]
                ]));
                return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            });

            $protected->get('/admins', function (Request $request, Response $response) {
                $userId = $request->getAttribute('userId');
                $usersColl = Db::getCollection('users');
                $caller = $usersColl->findOne(['_id' => new ObjectId($userId)]);

                if (!$caller || ($caller['email'] ?? '') !== 'admin@example.com') {
                    $response->getBody()->write(json_encode(['error' => 'Super Admin access required.']));
                    return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
                }

                $admins = $usersColl->find(['isAdmin' => true])->toArray();
                $resAdmins = array_map(function($a) {
                    return [
                        'id' => (string)$a['_id'],
                        'email' => $a['email'],
                        'name' => $a['name'] ?? $a['businessName'] ?? ''
                    ];
                }, $admins);

                $response->getBody()->write(json_encode(['admins' => $resAdmins]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->get('/admins/{id}/activity', function (Request $request, Response $response, array $args) {
                $userId = $request->getAttribute('userId');
                $usersColl = Db::getCollection('users');
                $caller = $usersColl->findOne(['_id' => new ObjectId($userId)]);

                if (!$caller || ($caller['email'] ?? '') !== 'admin@example.com') {
                    $response->getBody()->write(json_encode(['error' => 'Super Admin access required.']));
                    return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
                }

                $activityColl = Db::getCollection('activity_logs');
                $logs = $activityColl->find(['adminId' => $args['id']], ['sort' => ['createdAt' => -1]])->toArray();
                
                $resLogs = array_map(function($l) {
                    $l['id'] = (string)$l['_id'];
                    unset($l['_id']);
                    // Format dates if necessary, but leaving as is for JSON encoding compatibility
                    if (isset($l['createdAt']) && $l['createdAt'] instanceof UTCDateTime) {
                        $l['createdAt'] = $l['createdAt']->toDateTime()->format(\DateTime::ATOM);
                    }
                    return $l;
                }, $logs);

                $response->getBody()->write(json_encode(['logs' => $resLogs]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->get('/buyers/{id}/ips', function (Request $request, Response $response, array $args) {
                $userId = $request->getAttribute('userId');
                $usersColl = Db::getCollection('users');
                $adminDoc = $usersColl->findOne(['_id' => new ObjectId($userId)]);
                
                if (!$adminDoc || empty($adminDoc['isAdmin'])) {
                    $response->getBody()->write(json_encode(['error' => 'Forbidden']));
                    return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
                }

                $userIpLogColl = Db::getCollection('user_ip_log');
                $ips = $userIpLogColl->find(['userId' => $args['id']])->toArray();
                
                $resIps = array_map(function($i) {
                    return [
                        'id' => (string)$i['_id'],
                        'ipAddress' => $i['ipAddress'],
                        'detectedAt' => isset($i['detectedAt']) ? clone $i['detectedAt'] : null,
                        'source' => $i['source'] ?? null
                    ];
                }, $ips);

                $response->getBody()->write(json_encode(['ips' => $resIps]));
                return $response->withHeader('Content-Type', 'application/json');
            });

        })->add([Auth::class, 'authMiddleware']);

        $group->get('/check-ip', function (Request $request, Response $response) {
            $params = $request->getQueryParams();
            $ip = $params['ip'] ?? IpTracker::getClientIp($request);
            $blocked = IpTracker::checkIpBlocked($ip);

            if ($blocked) {
                $header = $request->getHeaderLine('Authorization');
                if (!empty($header) && str_starts_with($header, 'Bearer ')) {
                    $token = substr($header, 7);
                    try {
                        $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key(Auth::getJwtSecret(), 'HS256'));
                        $usersColl = Db::getCollection('users');
                        $user = $usersColl->findOne(['_id' => new ObjectId($decoded->sub)]);
                        if ($user && !empty($user['isAdmin'])) {
                            $blocked = false; // Admins bypass the block
                        }
                    } catch (\Exception $e) {}
                }
            }

            $response->getBody()->write(json_encode(['blocked' => $blocked]));
            return $response->withHeader('Content-Type', 'application/json');
        });
    }
}

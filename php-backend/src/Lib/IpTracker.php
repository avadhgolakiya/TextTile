<?php

namespace App\Lib;

use App\Db;
use MongoDB\BSON\ObjectId;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

class IpTracker
{
    public static function getClientIp(Request $request): string
    {
        $serverParams = $request->getServerParams();
        
        $ip = $serverParams['HTTP_X_FORWARDED_FOR'] ?? null;
        if ($ip) {
            $ip = trim(explode(',', $ip)[0]);
        }
        
        if (!$ip) {
            $ip = $serverParams['HTTP_X_REAL_IP'] ?? null;
        }
        
        if (!$ip) {
            $ip = $serverParams['REMOTE_ADDR'] ?? '127.0.0.1';
        }

        if (str_starts_with($ip, '::ffff:')) {
            $ip = substr($ip, 7);
        }
        
        return $ip;
    }

    public static function checkIpBlocked(string $ipAddress): bool
    {
        try {
            $coll = Db::getCollection('blocked_user_ips');
            $blocked = $coll->findOne(['ipAddress' => $ipAddress]);
            return (bool)$blocked;
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function trackUserIp(string $userId, string $ipAddress, string $source): void
    {
        if (empty($ipAddress)) return;
        
        try {
            $coll = Db::getCollection('user_ip_log');
            $coll->updateOne(
                ['userId' => $userId, 'ipAddress' => $ipAddress],
                ['$set' => [
                    'userId' => $userId,
                    'ipAddress' => $ipAddress,
                    'detectedAt' => new \MongoDB\BSON\UTCDateTime(),
                    'source' => $source
                ]],
                ['upsert' => true]
            );
        } catch (\Exception $e) {
            // Silently log
        }
    }

    public static function globalIpBlocker(Request $request, RequestHandler $handler): Response
    {
        $path = $request->getUri()->getPath();
        if ($path === '/api/health' || $path === '/api/auth/check-ip') {
            return $handler->handle($request);
        }

        $ip = self::getClientIp($request);
        $isBlocked = self::checkIpBlocked($ip);

        if ($isBlocked) {
            // Check admin bypass
            $header = $request->getHeaderLine('Authorization');
            if (!empty($header) && str_starts_with($header, 'Bearer ')) {
                $token = substr($header, 7);
                try {
                    $decoded = JWT::decode($token, new Key(Auth::getJwtSecret(), 'HS256'));
                    $users = Db::getCollection('users');
                    $user = $users->findOne(['_id' => new ObjectId($decoded->sub)]);
                    if ($user && isset($user['isAdmin']) && $user['isAdmin']) {
                        return $handler->handle($request);
                    }
                } catch (\Exception $e) {
                    // Invalid token, proceed to block
                }
            }

            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Your access has been restricted.']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request);
    }
}

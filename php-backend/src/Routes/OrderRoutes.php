<?php

namespace App\Routes;

use App\Db;
use App\Lib\Auth;
use App\Lib\Notifications;
use App\Lib\Activity;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

class OrderRoutes
{
    private static function formatDate($utcDateTime): string
    {
        $months = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        $timestamp = time();
        if ($utcDateTime instanceof UTCDateTime) {
            $timestamp = $utcDateTime->toDateTime()->getTimestamp();
        } elseif (is_string($utcDateTime) || is_numeric($utcDateTime)) {
            $timestamp = strtotime((string)$utcDateTime);
            if (!$timestamp) $timestamp = (int)$utcDateTime;
        }

        $date = new \DateTime();
        $date->setTimestamp($timestamp);
        
        $day = str_pad($date->format('j'), 2, '0', STR_PAD_LEFT);
        $monthStr = $months[(int)$date->format('n')];
        $year = $date->format('Y');

        return "{$day} {$monthStr} {$year}";
    }

    private static function mapOrder(array $doc): array
    {
        $items = $doc['items'] ?? [];
        $first = $items[0] ?? [];
        $extra = count($items) - 1;
        
        $title = 'Order';
        if (count($items) > 0) {
            $title = $extra > 0 ? ($first['name'] ?? '') . " & {$extra} more" : ($first['name'] ?? '');
        }

        $itemCount = count($items);
        $s = $itemCount === 1 ? '' : 's';
        
        return [
            'id' => (string)$doc['_id'],
            'dateLabel' => self::formatDate($doc['createdAt'] ?? time()),
            'title' => $title,
            'itemCountLabel' => "{$itemCount} item{$s}",
            'total' => $doc['total'] ?? 0,
            'thumbnailUrl' => $first['imageUrl'] ?? '',
            'status' => $doc['status'] ?? 'pending',
            'buyerName' => $doc['buyerName'] ?? null,
            'isManual' => $doc['isManual'] ?? false,
            'items' => $items,
        ];
    }

    public static function setup(RouteCollectorProxy $group): void
    {
        // Require auth for all order routes
        $group->group('', function (RouteCollectorProxy $protected) {
            
            $protected->get('[/]', function (Request $request, Response $response) {
                $ordersColl = Db::getCollection('orders');
                $docs = $ordersColl->find([], ['sort' => ['createdAt' => -1]])->toArray();
                
                $orders = array_map([self::class, 'mapOrder'], $docs);
                
                $response->getBody()->write(json_encode(['orders' => $orders]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->get('/mine', function (Request $request, Response $response) {
                $userId = $request->getAttribute('userId');
                $ordersColl = Db::getCollection('orders');
                $docs = $ordersColl->find(['buyerId' => $userId], ['sort' => ['createdAt' => -1]])->toArray();
                
                $orders = array_map([self::class, 'mapOrder'], $docs);
                
                $response->getBody()->write(json_encode(['orders' => $orders]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->post('[/]', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $buyerName = $body['buyerName'] ?? null;
                $buyerPhone = $body['buyerPhone'] ?? null;
                $lines = $body['lines'] ?? [];
                $total = $body['total'] ?? null;

                if (!$buyerName || !is_array($lines) || $total === null) {
                    $response->getBody()->write(json_encode(['error' => 'Invalid order payload']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $userId = $request->getAttribute('userId');
                $usersColl = Db::getCollection('users');
                $userDoc = $usersColl->findOne(['_id' => new ObjectId($userId)]);
                
                if (!$userDoc) {
                    $response->getBody()->write(json_encode(['error' => 'User not found']));
                    return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
                }
                
                if (!empty($userDoc['isBlocked'])) {
                    $response->getBody()->write(json_encode(['error' => 'Your account has been blocked. You cannot place orders.']));
                    return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
                }

                $productIds = array_column($lines, 'productId');
                $productsColl = Db::getCollection('products');
                
                $products = $productsColl->find(['_id' => ['$in' => $productIds]])->toArray();
                $byId = [];
                foreach ($products as $p) {
                    $byId[(string)$p['_id']] = (array)$p;
                }

                $items = [];
                foreach ($lines as $line) {
                    $pid = $line['productId'];
                    $p = $byId[$pid] ?? null;
                    $items[] = [
                        'name' => $p['name'] ?? 'Item',
                        'code' => $pid,
                        'qty' => $line['quantity'] ?? 1,
                        'price' => $p['price'] ?? 0,
                        'imageUrl' => $p['imageUrl'] ?? '',
                    ];
                }

                $ordersColl = Db::getCollection('orders');
                $ordersColl->insertOne([
                    'buyerId' => $userId,
                    'buyerName' => $buyerName,
                    'buyerPhone' => $buyerPhone,
                    'items' => $items,
                    'total' => $total,
                    'status' => 'pending',
                    'createdAt' => new UTCDateTime()
                ]);

                foreach ($lines as $line) {
                    $pid = $line['productId'];
                    $p = $byId[$pid] ?? null;
                    if ($p && isset($p['stock'])) {
                        $oldStock = (int)$p['stock'];
                        $qty = (int)($line['quantity'] ?? 1);
                        $newStock = max(0, $oldStock - $qty);
                        
                        $productsColl->updateOne(
                            ['_id' => $pid],
                            ['$set' => ['stock' => $newStock]]
                        );
                        
                        if ($oldStock > 10 && $newStock > 0 && $newStock <= 10) {
                            $merged = array_merge($p, ['stock' => $newStock]);
                            Notifications::notifyLowStock($merged);
                        }
                    }
                }

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            });

            $protected->post('/manual', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $buyerName = $body['buyerName'] ?? null;
                $itemName = $body['itemName'] ?? null;
                $quantity = $body['quantity'] ?? null;
                $price = $body['price'] ?? null;
                $imageUrl = $body['imageUrl'] ?? '';

                if (!$buyerName || !$itemName || !$quantity || $price === null) {
                    $response->getBody()->write(json_encode(['error' => 'buyerName, itemName, quantity, and price are required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $userId = $request->getAttribute('userId');
                $usersColl = Db::getCollection('users');
                $userDoc = $usersColl->findOne(['_id' => new ObjectId($userId)]);
                
                if (!$userDoc || empty($userDoc['isAdmin'])) {
                    $response->getBody()->write(json_encode(['error' => 'Forbidden. Admin access required.']));
                    return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
                }

                $qty = (int)$quantity;
                $prc = (float)$price;
                $total = $qty * $prc;

                $items = [[
                    'name' => trim((string)$itemName),
                    'code' => 'MANUAL',
                    'qty' => $qty,
                    'price' => $prc,
                    'imageUrl' => trim((string)$imageUrl),
                ]];

                $ordersColl = Db::getCollection('orders');
                $ordersColl->insertOne([
                    'buyerId' => $userId,
                    'buyerName' => trim((string)$buyerName),
                    'buyerPhone' => null,
                    'items' => $items,
                    'total' => $total,
                    'status' => 'pending',
                    'isManual' => true,
                    'createdAt' => new UTCDateTime()
                ]);

                Activity::logActivity($request, 'created_manual_order', [
                    'buyerName' => trim((string)$buyerName),
                    'total' => $total
                ]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            });

            $protected->patch('/{id}/status', function (Request $request, Response $response, array $args) {
                $body = $request->getParsedBody();
                $status = $body['status'] ?? null;
                
                if (!$status) {
                    $response->getBody()->write(json_encode(['error' => 'Status is required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $id = clone new ObjectId($args['id']);
                
                $ordersColl = Db::getCollection('orders');
                $ordersColl->updateOne(
                    ['_id' => clone new ObjectId($id)],
                    ['$set' => ['status' => $status, 'updatedAt' => new UTCDateTime()]]
                );

                Activity::logActivity($request, 'updated_order_status', [
                    'orderId' => (string)$id,
                    'status' => $status
                ]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

        })->add([Auth::class, 'authMiddleware']);
    }
}

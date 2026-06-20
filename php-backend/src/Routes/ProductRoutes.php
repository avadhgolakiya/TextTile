<?php

namespace App\Routes;

use App\Db;
use App\Lib\Auth;
use App\Lib\Notifications;
use App\Lib\Activity;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use MongoDB\BSON\Regex;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

class ProductRoutes
{
    public static function setup(RouteCollectorProxy $group): void
    {
        $group->get('[/]', function (Request $request, Response $response) {
            $params = $request->getQueryParams();
            $category = $params['category'] ?? null;
            $admin = ($params['admin'] ?? '') === 'true';

            $filter = [];
            if (!$admin) {
                $filter['isVisible'] = true;
            }

            if ($category) {
                $filter['categoryKey'] = new Regex('^' . preg_quote(trim($category), '/') . '$', 'i');
            }

            $productsColl = Db::getCollection('products');
            $docs = $productsColl->find($filter, ['sort' => ['createdAt' => -1]])->toArray();

            $products = array_map([Auth::class, 'mapProduct'], $docs);

            $response->getBody()->write(json_encode(['products' => $products]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        $group->get('/featured', function (Request $request, Response $response) {
            $productsColl = Db::getCollection('products');
            $docs = $productsColl->find(
                ['isFeatured' => true, 'isVisible' => true],
                ['sort' => ['createdAt' => -1]]
            )->toArray();

            $products = array_map([Auth::class, 'mapProduct'], $docs);

            $response->getBody()->write(json_encode(['products' => $products]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        $group->get('/{id}', function (Request $request, Response $response, array $args) {
            $id = $args['id'];
            if (strlen($id) !== 24 && !preg_match('/^[a-f0-9]{24}$/i', $id)) {
                $idObj = $id; // if it's using custom IDs
            } else {
                $idObj = new ObjectId($id);
            }

            // The original code uses string for ID `findOne({ _id: req.params.id, ... })`
            // Let's assume it's stored as string or ObjectId. If it fails to find by string, try ObjectId.
            // Wait, looking at products.js: `findOne({ _id: req.params.id })`. It doesn't use `new ObjectId()`.
            // So IDs are stored as strings!
            
            $productsColl = Db::getCollection('products');
            $doc = $productsColl->findOne(['_id' => $id, 'isVisible' => true]);
            
            if (!$doc) {
                // Fallback to ObjectId just in case
                try {
                    $doc = $productsColl->findOne(['_id' => new ObjectId($id), 'isVisible' => true]);
                } catch (\Exception $e) {}
            }

            if (!$doc) {
                $response->getBody()->write(json_encode(['error' => 'Product not found']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode(['product' => Auth::mapProduct($doc)]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        // Protected Admin Routes
        $group->group('', function (RouteCollectorProxy $protected) {
            $protected->post('[/]', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $p = $body['product'] ?? null;
                $oldId = $body['oldId'] ?? null;

                if (!isset($p['id']) || !isset($p['name'])) {
                    $response->getBody()->write(json_encode(['error' => 'Invalid product payload']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $productsColl = Db::getCollection('products');

                if ($oldId && $oldId !== $p['id']) {
                    $productsColl->deleteOne(['_id' => $oldId]);
                }

                $existingProduct = $productsColl->findOne(['_id' => $p['id']]);
                $isNewProduct = !$existingProduct && (!$oldId || $oldId === $p['id']);

                $productsColl->updateOne(
                    ['_id' => $p['id']],
                    [
                        '$set' => [
                            'name' => $p['name'],
                            'subtitle' => $p['subtitle'] ?? '',
                            'price' => isset($p['price']) ? (float)$p['price'] : null,
                            'originalPrice' => $p['originalPrice'] ?? null,
                            'imageUrl' => $p['imageUrl'] ?? '',
                            'imageUrls' => $p['imageUrls'] ?? [],
                            'badge' => $p['badge'] ?? null,
                            'categoryKey' => $p['categoryKey'] ?? null,
                            'isFeatured' => $body['isFeatured'] ?? false,
                            'isVisible' => $p['isVisible'] ?? true,
                            'sareeSet' => $p['sareeSet'] ?? null,
                            'stock' => isset($p['stock']) ? (int)$p['stock'] : 0,
                            'updatedAt' => new UTCDateTime(),
                        ],
                        '$setOnInsert' => [
                            'createdAt' => new UTCDateTime(),
                        ]
                    ],
                    ['upsert' => true]
                );

                if ($isNewProduct && ($p['isVisible'] ?? true)) {
                    Notifications::notifyNewProduct($p);
                } else if (!$isNewProduct && $existingProduct) {
                    $oldStock = $existingProduct['stock'] ?? 0;
                    $newStock = isset($p['stock']) ? (int)$p['stock'] : 0;
                    if ($oldStock > 10 && $newStock > 0 && $newStock <= 10) {
                        $merged = array_merge((array)$existingProduct, $p);
                        Notifications::notifyLowStock($merged);
                    }
                }

                Activity::logActivity($request, $isNewProduct ? 'created_product' : 'updated_product', [
                    'productId' => $p['id'],
                    'name' => $p['name']
                ]);

                $response->getBody()->write(json_encode(['ok' => true, 'isNew' => $isNewProduct]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->delete('/{id}', function (Request $request, Response $response, array $args) {
                $id = $args['id'];
                $productsColl = Db::getCollection('products');
                $doc = $productsColl->findOne(['_id' => $id]);
                if (!$doc) {
                    try {
                        $doc = $productsColl->findOne(['_id' => new ObjectId($id)]);
                        $id = new ObjectId($id);
                    } catch (\Exception $e) {}
                }

                $productsColl->deleteOne(['_id' => $id]);
                
                Activity::logActivity($request, 'deleted_product', [
                    'productId' => (string)$id,
                    'name' => $doc['name'] ?? null
                ]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->patch('/{id}/visibility', function (Request $request, Response $response, array $args) {
                $body = $request->getParsedBody();
                $isVisible = !empty($body['isVisible']);
                
                $id = $args['id'];
                $productsColl = Db::getCollection('products');
                $productsColl->updateOne(
                    ['_id' => $id],
                    ['$set' => ['isVisible' => $isVisible, 'updatedAt' => new UTCDateTime()]]
                );

                Activity::logActivity($request, 'updated_product_visibility', [
                    'productId' => $id,
                    'isVisible' => $isVisible
                ]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->patch('/{id}/featured', function (Request $request, Response $response, array $args) {
                $body = $request->getParsedBody();
                $isFeatured = !empty($body['isFeatured']);
                
                $id = $args['id'];
                $productsColl = Db::getCollection('products');
                $productsColl->updateOne(
                    ['_id' => $id],
                    ['$set' => ['isFeatured' => $isFeatured, 'updatedAt' => new UTCDateTime()]]
                );

                Activity::logActivity($request, 'updated_product_featured', [
                    'productId' => $id,
                    'isFeatured' => $isFeatured
                ]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->post('/{id}/notify', function (Request $request, Response $response, array $args) {
                $id = $args['id'];
                $productsColl = Db::getCollection('products');
                $doc = $productsColl->findOne(['_id' => $id]);
                if (!$doc) {
                    try {
                        $doc = $productsColl->findOne(['_id' => new ObjectId($id)]);
                    } catch (\Exception $e) {}
                }

                if (!$doc) {
                    $response->getBody()->write(json_encode(['error' => 'Product not found']));
                    return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
                }

                Notifications::notifyNewProduct((array)$doc);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

        })->add([Auth::class, 'authMiddleware']);
    }
}

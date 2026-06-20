<?php

namespace App\Routes;

use App\Db;
use App\Lib\Auth;
use App\Lib\Activity;
use MongoDB\BSON\UTCDateTime;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

class CategoryRoutes
{
    public static function setup(RouteCollectorProxy $group): void
    {
        $group->get('[/]', function (Request $request, Response $response) {
            $categoriesColl = Db::getCollection('categories');
            $docs = $categoriesColl->find()->toArray();
            
            if (empty($docs)) {
                $defaults = [
                    ['_id' => 'sarees', 'key' => 'sarees', 'name' => 'Sarees', 'icon' => '🥻'],
                    ['_id' => 'suits', 'key' => 'suits', 'name' => 'Suits', 'icon' => '👗'],
                    ['_id' => 'lehenga', 'key' => 'lehenga', 'name' => 'Lehenga', 'icon' => '✨'],
                ];
                // In MongoDB PHP Library we can't easily map back the objects directly like this for insertion
                // without keeping the arrays
                foreach ($defaults as $idx => $doc) {
                    $doc['createdAt'] = new UTCDateTime();
                    $defaults[$idx] = $doc;
                }
                $categoriesColl->insertMany($defaults);
                $docs = $defaults;
            }

            $categories = array_map(function($doc) {
                return [
                    'key' => (string)($doc['_id'] ?? ''),
                    'name' => $doc['name'] ?? '',
                    'icon' => $doc['icon'] ?? '',
                ];
            }, $docs);

            $response->getBody()->write(json_encode(['categories' => $categories]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        $group->group('', function (RouteCollectorProxy $protected) {
            $protected->post('[/]', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $name = $body['name'] ?? null;
                $icon = $body['icon'] ?? '✨';

                if (!$name) {
                    $response->getBody()->write(json_encode(['error' => 'Category name is required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $key = strtolower(trim((string)$name));
                $key = preg_replace('/[^a-z0-9]+/', '-', $key);
                $key = trim($key, '-');

                if (!$key) {
                    $response->getBody()->write(json_encode(['error' => 'Invalid category name']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $categoriesColl = Db::getCollection('categories');
                $existing = $categoriesColl->findOne(['_id' => $key]);

                if ($existing) {
                    $response->getBody()->write(json_encode(['error' => "Category \"{$name}\" already exists"]));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $categoriesColl->insertOne([
                    '_id' => $key,
                    'key' => $key,
                    'name' => trim((string)$name),
                    'icon' => $icon,
                    'createdAt' => new UTCDateTime()
                ]);

                Activity::logActivity($request, 'added_category', ['key' => $key, 'name' => trim((string)$name)]);

                $response->getBody()->write(json_encode([
                    'ok' => true,
                    'category' => [
                        'key' => $key,
                        'name' => trim((string)$name),
                        'icon' => $icon
                    ]
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->delete('/{key}', function (Request $request, Response $response, array $args) {
                $key = $args['key'];
                $categoriesColl = Db::getCollection('categories');
                
                $doc = $categoriesColl->findOne(['_id' => $key]);
                if (!$doc) {
                    $response->getBody()->write(json_encode(['error' => 'Category not found']));
                    return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
                }

                $categoriesColl->deleteOne(['_id' => $key]);

                Activity::logActivity($request, 'deleted_category', ['key' => $key, 'name' => $doc['name'] ?? null]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });
        })->add([Auth::class, 'authMiddleware']);
    }
}

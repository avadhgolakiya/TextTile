<?php

namespace App\Routes;

use App\Db;
use App\Lib\Auth;
use App\Lib\Activity;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

class BannerRoutes
{
    public static function setup(RouteCollectorProxy $group): void
    {
        $group->get('[/]', function (Request $request, Response $response) {
            $bannersColl = Db::getCollection('banners');
            $docs = $bannersColl->find([], ['sort' => ['sortOrder' => 1, 'createdAt' => 1]])->toArray();

            $urls = array_map(fn($doc) => $doc['imageUrl'] ?? '', $docs);
            $banners = array_map(function($doc) {
                return [
                    'id' => (string)$doc['_id'],
                    'image_url' => $doc['imageUrl'] ?? '',
                    'redirect_url' => $doc['redirectUrl'] ?? '',
                    'sort_order' => $doc['sortOrder'] ?? 0,
                ];
            }, $docs);

            $response->getBody()->write(json_encode([
                'urls' => $urls,
                'banners' => $banners
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        $group->group('', function (RouteCollectorProxy $protected) {
            
            $protected->post('[/]', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $imageUrl = $body['imageUrl'] ?? null;
                $sortOrder = $body['sortOrder'] ?? 0;
                $redirectUrl = $body['redirectUrl'] ?? '';

                if (!$imageUrl) {
                    $response->getBody()->write(json_encode(['error' => 'imageUrl is required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $bannersColl = Db::getCollection('banners');
                $bannersColl->insertOne([
                    'imageUrl' => $imageUrl,
                    'redirectUrl' => $redirectUrl,
                    'sortOrder' => (int)$sortOrder,
                    'createdAt' => new UTCDateTime()
                ]);

                Activity::logActivity($request, 'added_banner', ['imageUrl' => $imageUrl]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->delete('/{id}', function (Request $request, Response $response, array $args) {
                $id = $args['id'];
                $bannersColl = Db::getCollection('banners');
                $bannersColl->deleteOne(['_id' => new ObjectId($id)]);

                Activity::logActivity($request, 'deleted_banner', ['bannerId' => $id]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

            $protected->patch('/reorder', function (Request $request, Response $response) {
                $body = $request->getParsedBody();
                $orderedIds = $body['orderedIds'] ?? null;

                if (!$orderedIds || !is_array($orderedIds)) {
                    $response->getBody()->write(json_encode(['error' => 'orderedIds array is required']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }

                $bannersColl = Db::getCollection('banners');
                
                // Using updateOne inside loop is sufficient since PHP mongodb bulk write is more complex
                foreach ($orderedIds as $index => $id) {
                    $bannersColl->updateOne(
                        ['_id' => new ObjectId($id)],
                        ['$set' => ['sortOrder' => $index]]
                    );
                }

                Activity::logActivity($request, 'reordered_slider', ['count' => count($orderedIds)]);

                $response->getBody()->write(json_encode(['ok' => true]));
                return $response->withHeader('Content-Type', 'application/json');
            });

        })->add([Auth::class, 'authMiddleware']);
    }
}

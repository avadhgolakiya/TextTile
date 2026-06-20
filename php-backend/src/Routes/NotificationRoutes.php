<?php

namespace App\Routes;

use App\Lib\Firebase;
use App\Lib\Notifications;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

class NotificationRoutes
{
    public static function setup(RouteCollectorProxy $group): void
    {
        $group->post('/register-token', function (Request $request, Response $response) {
            $body = $request->getParsedBody();
            $token = $body['token'] ?? null;

            if (!$token || !is_string($token)) {
                $response->getBody()->write(json_encode(['error' => 'FCM token is required']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            if (!Firebase::isConfigured()) {
                $response->getBody()->write(json_encode(['error' => 'Push notifications are not configured on the server']));
                return $response->withStatus(503)->withHeader('Content-Type', 'application/json');
            }

            Notifications::subscribeToNewProducts(trim($token));
            
            $response->getBody()->write(json_encode(['ok' => true]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        $group->get('/status', function (Request $request, Response $response) {
            $response->getBody()->write(json_encode(['configured' => Firebase::isConfigured()]));
            return $response->withHeader('Content-Type', 'application/json');
        });
    }
}

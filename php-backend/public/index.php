<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Lib\IpTracker;
use Slim\Routing\RouteCollectorProxy;

require __DIR__ . '/../vendor/autoload.php';

// Load Environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

// Setup DI Container
$container = new Container();
AppFactory::setContainer($container);

// Create App
$app = AppFactory::create();

// Add Routing Middleware
$app->addRoutingMiddleware();

// Add Body Parsing Middleware
$app->addBodyParsingMiddleware();

// Add Error Middleware
$app->addErrorMiddleware(true, true, true);

// Add CORS Middleware
$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// OPTIONS preflight
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Global IP Blocker Middleware
$app->add([IpTracker::class, 'globalIpBlocker']);

// Health check
$app->get('/api/health', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['ok' => true]));
    return $response->withHeader('Content-Type', 'application/json');
});

// API Routes
$app->group('/api', function (RouteCollectorProxy $group) {
    $group->group('/auth', function ($authGroup) {
        \App\Routes\AuthRoutes::setup($authGroup);
    });

    $group->group('/products', function ($productGroup) {
        \App\Routes\ProductRoutes::setup($productGroup);
    });

    $group->group('/orders', function ($orderGroup) {
        \App\Routes\OrderRoutes::setup($orderGroup);
    });

    $group->group('/banners', function ($bannerGroup) {
        \App\Routes\BannerRoutes::setup($bannerGroup);
    });

    $group->group('/categories', function ($catGroup) {
        \App\Routes\CategoryRoutes::setup($catGroup);
    });

    $group->group('/notifications', function ($notifGroup) {
        \App\Routes\NotificationRoutes::setup($notifGroup);
    });

    $group->group('/upload', function ($uploadGroup) {
        \App\Routes\UploadRoutes::setup($uploadGroup);
    });

    // GST routes are mounted on /api
    \App\Routes\GstRoutes::setup($group);
});

$app->run();

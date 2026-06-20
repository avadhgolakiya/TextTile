<?php

namespace App\Lib;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

class Auth
{
    public static function getJwtSecret(): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? null;
        if (!$secret) {
            throw new \Exception('JWT_SECRET is required');
        }
        return $secret;
    }

    public static function signToken(string $userId): string
    {
        $payload = [
            'sub' => $userId,
            'exp' => time() + (30 * 24 * 60 * 60) // 30 days
        ];
        return JWT::encode($payload, self::getJwtSecret(), 'HS256');
    }

    public static function authMiddleware(Request $request, RequestHandler $handler): Response
    {
        $header = $request->getHeaderLine('Authorization');
        if (empty($header) || !str_starts_with($header, 'Bearer ')) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $token = substr($header, 7);
        try {
            $decoded = JWT::decode($token, new Key(self::getJwtSecret(), 'HS256'));
            $userId = $decoded->sub;
            
            // Inject userId into request attributes
            $request = $request->withAttribute('userId', $userId);

            // Asynchronously track IP
            $ip = IpTracker::getClientIp($request);
            try {
                IpTracker::trackUserIp($userId, $ip, 'api_request');
            } catch (\Exception $e) {
                // Log silently
            }

            return $handler->handle($request);
        } catch (\Exception $e) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Invalid or expired session']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    }

    public static function mapUser($doc): ?array
    {
        if (!$doc) return null;
        
        return [
            'id' => (string)$doc['_id'],
            'email' => $doc['email'],
            'name' => $doc['name'] ?? null,
            'businessName' => $doc['businessName'] ?? null,
            'phone' => $doc['phone'] ?? null,
            'gstin' => $doc['gstin'] ?? null,
            'address' => $doc['address'] ?? null,
            'isAdmin' => $doc['isAdmin'] ?? false,
            'isBlocked' => $doc['isBlocked'] ?? false,
            'isSuperAdmin' => $doc['email'] === 'admin@example.com',
        ];
    }

    public static function mapProduct($doc): ?array
    {
        if (!$doc) return null;
        
        $imageUrl = $doc['imageUrl'] ?? '';
        $rawUrls = isset($doc['imageUrls']) && is_array(json_decode(json_encode($doc['imageUrls']), true)) 
            ? json_decode(json_encode($doc['imageUrls']), true) 
            : [];
        $imageUrls = count($rawUrls) > 0 ? $rawUrls : ($imageUrl ? [$imageUrl] : []);

        return [
            'id' => (string)$doc['_id'],
            'name' => $doc['name'],
            'subtitle' => $doc['subtitle'] ?? '',
            'price' => $doc['price'] ?? 0,
            'originalPrice' => $doc['originalPrice'] ?? null,
            'imageUrl' => $imageUrl,
            'imageUrls' => $imageUrls,
            'badge' => $doc['badge'] ?? null,
            'categoryKey' => $doc['categoryKey'] ?? null,
            'isVisible' => $doc['isVisible'] ?? true,
            'sareeSet' => $doc['sareeSet'] ?? null,
            'stock' => $doc['stock'] ?? 0,
            'isFeatured' => $doc['isFeatured'] ?? false,
        ];
    }
}

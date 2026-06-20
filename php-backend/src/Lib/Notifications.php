<?php

namespace App\Lib;

use App\Db;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use MongoDB\BSON\UTCDateTime;

class Notifications
{
    public const NEW_PRODUCTS_TOPIC = 'new-products';

    public static function subscribeToNewProducts(string $token): bool
    {
        $messaging = Firebase::getMessaging();
        if (!$messaging) return false;

        try {
            $messaging->subscribeToTopic(self::NEW_PRODUCTS_TOPIC, [$token]);

            $coll = Db::getCollection('fcm_tokens');
            $coll->updateOne(
                ['token' => $token],
                ['$set' => [
                    'topic' => self::NEW_PRODUCTS_TOPIC,
                    'updatedAt' => new UTCDateTime()
                ]],
                ['upsert' => true]
            );
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function notifyNewProduct(array $product): bool
    {
        $messaging = Firebase::getMessaging();
        if (!$messaging) return false;

        $price = !empty($product['price']) ? "₹{$product['price']}" : '';
        $body = !empty($product['subtitle']) 
            ? "{$product['name']} — {$product['subtitle']}" . ($price ? " · $price" : '')
            : "{$product['name']}" . ($price ? " · $price" : '');

        $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'https://text-tile.vercel.app', '/');
        $id = (string)($product['id'] ?? $product['_id'] ?? '');
        $productLink = "$frontendUrl/products/$id";

        $message = CloudMessage::withTarget('topic', self::NEW_PRODUCTS_TOPIC)
            ->withNotification(Notification::create('🧵 New saree added — Swastik Fashion', $body))
            ->withData([
                'type' => 'new_product',
                'productId' => $id,
                'productName' => (string)($product['name'] ?? ''),
                'link' => $productLink,
            ])
            ->withWebPushConfig([
                'fcmOptions' => [
                    'link' => $productLink
                ],
                'notification' => [
                    'icon' => "{$frontendUrl}/icon-192.png"
                ]
            ]);

        try {
            $messaging->send($message);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function notifyLowStock(array $product): bool
    {
        $messaging = Firebase::getMessaging();
        if (!$messaging) return false;

        $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'https://text-tile.vercel.app', '/');
        $id = (string)($product['id'] ?? $product['_id'] ?? '');
        $productLink = "$frontendUrl/products/$id";

        $stock = $product['stock'] ?? 0;
        $message = CloudMessage::withTarget('topic', self::NEW_PRODUCTS_TOPIC)
            ->withNotification(Notification::create("🏃 Hurry! Only {$stock} left", "{$product['name']} is almost sold out. Grab yours before it's gone!"))
            ->withData([
                'type' => 'low_stock',
                'productId' => $id,
                'productName' => (string)($product['name'] ?? ''),
                'link' => $productLink,
            ])
            ->withWebPushConfig([
                'fcmOptions' => [
                    'link' => $productLink
                ],
                'notification' => [
                    'icon' => "{$frontendUrl}/icon-192.png"
                ]
            ]);

        try {
            $messaging->send($message);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}

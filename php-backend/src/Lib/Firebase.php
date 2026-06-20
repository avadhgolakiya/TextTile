<?php

namespace App\Lib;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Contract\Messaging;

class Firebase
{
    private static ?Messaging $messaging = null;
    private static bool $initialized = false;
    private static bool $initFailed = false;

    public static function getMessaging(): ?Messaging
    {
        if (self::$initFailed) return null;
        if (self::$initialized) return self::$messaging;

        $credPath = $_ENV['GOOGLE_APPLICATION_CREDENTIALS'] ?? null;
        if ($credPath) {
            if (str_starts_with($credPath, './')) {
                $credPath = __DIR__ . '/../../' . substr($credPath, 2);
            }
            if (file_exists($credPath)) {
                $factory = (new Factory)->withServiceAccount($credPath);
                self::$messaging = $factory->createMessaging();
                self::$initialized = true;
                return self::$messaging;
            }
        }
        $projectId = $_ENV['FIREBASE_PROJECT_ID'] ?? null;
        $clientEmail = $_ENV['FIREBASE_CLIENT_EMAIL'] ?? null;
        $privateKey = $_ENV['FIREBASE_PRIVATE_KEY'] ?? null;

        if ($projectId && $clientEmail && $privateKey) {
            $privateKey = str_replace('\\n', "\n", $privateKey);
            $serviceAccount = [
                'project_id' => $projectId,
                'client_email' => $clientEmail,
                'private_key' => $privateKey,
            ];
            $factory = (new Factory)->withServiceAccount($serviceAccount);
            self::$messaging = $factory->createMessaging();
            self::$initialized = true;
            return self::$messaging;
        }

        self::$initFailed = true;
        return null;
    }

    public static function isConfigured(): bool
    {
        return self::getMessaging() !== null;
    }
}

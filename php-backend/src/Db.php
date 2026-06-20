<?php

namespace App;

use MongoDB\Client;
use MongoDB\Database;

class Db
{
    private static ?Client $client = null;
    private static ?Database $db = null;

    /**
     * Get the MongoDB client connection.
     * Throws an exception if DATABASE_URL is not set.
     */
    public static function getClient(): Client
    {
        if (self::$client !== null) {
            return self::$client;
        }

        $uri = $_ENV['DATABASE_URL'] ?? null;
        if (!$uri) {
            throw new \Exception('DATABASE_URL is required in .env');
        }

        self::$client = new Client($uri);
        return self::$client;
    }

    /**
     * Get the main 'saarika' database instance.
     */
    public static function getDatabase(): Database
    {
        if (self::$db !== null) {
            return self::$db;
        }

        $client = self::getClient();
        self::$db = $client->selectDatabase('saarika');
        return self::$db;
    }

    /**
     * Helper to get a specific collection from the saarika database.
     */
    public static function getCollection(string $name)
    {
        return self::getDatabase()->selectCollection($name);
    }
}

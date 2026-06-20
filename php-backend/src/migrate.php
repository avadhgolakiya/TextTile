<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Db;
use Dotenv\Dotenv;

// Load .env
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

try {
    $db = Db::getDatabase();
    echo "Connected to MongoDB.\n";

    // Indexes for products
    $products = $db->selectCollection('products');
    $products->createIndex(['isVisible' => 1]);
    $products->createIndex(['isFeatured' => 1]);
    $products->createIndex(['categoryKey' => 1]);
    $products->createIndex(['createdAt' => -1]);
    echo "Created indexes for products.\n";

    // Indexes for orders
    $orders = $db->selectCollection('orders');
    $orders->createIndex(['userId' => 1]);
    $orders->createIndex(['status' => 1]);
    $orders->createIndex(['createdAt' => -1]);
    echo "Created indexes for orders.\n";

    // Indexes for categories
    $categories = $db->selectCollection('categories');
    $categories->createIndex(['key' => 1], ['unique' => true]);
    $categories->createIndex(['order' => 1]);
    echo "Created indexes for categories.\n";

    // Indexes for users
    $users = $db->selectCollection('users');
    $users->createIndex(['email' => 1], ['unique' => true]);
    echo "Created indexes for users.\n";

    // Indexes for banners
    $banners = $db->selectCollection('banners');
    $banners->createIndex(['isActive' => 1]);
    $banners->createIndex(['order' => 1]);
    echo "Created indexes for banners.\n";

    // Indexes for activity
    $activity = $db->selectCollection('activity_logs');
    $activity->createIndex(['timestamp' => -1]);
    echo "Created indexes for activity_logs.\n";

    // Indexes for blocked_ips
    $blockedIps = $db->selectCollection('blocked_ips');
    $blockedIps->createIndex(['ip' => 1], ['unique' => true]);
    echo "Created indexes for blocked_ips.\n";

    echo "Migration completed successfully.\n";

} catch (\Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

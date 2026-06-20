<?php

namespace App\Lib;

use App\Db;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use Psr\Http\Message\ServerRequestInterface as Request;

class Activity
{
    public static function logActivity(Request $request, string $action, array $details = []): void
    {
        try {
            $userId = $request->getAttribute('userId');
            if (!$userId) return; // Need user context

            $usersColl = Db::getCollection('users');
            $userDoc = $usersColl->findOne(['_id' => new ObjectId($userId)]);

            if (!$userDoc || empty($userDoc['isAdmin'])) return; // Only log admin activity

            $activityColl = Db::getCollection('activity_logs');
            $activityColl->insertOne([
                'adminId' => $userId,
                'adminName' => $userDoc['name'] ?? 'Admin',
                'adminEmail' => $userDoc['email'],
                'action' => $action,
                'details' => $details,
                'createdAt' => new UTCDateTime()
            ]);
        } catch (\Exception $e) {
            // Silently log
        }
    }
}

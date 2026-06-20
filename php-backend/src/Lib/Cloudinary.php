<?php

namespace App\Lib;

use Cloudinary\Cloudinary as CloudinarySdk;
use Cloudinary\Configuration\Configuration;

class Cloudinary
{
    private static ?CloudinarySdk $cloudinary = null;

    public static function getInstance(): CloudinarySdk
    {
        if (self::$cloudinary === null) {
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '',
                    'api_key'    => $_ENV['CLOUDINARY_API_KEY'] ?? '',
                    'api_secret' => $_ENV['CLOUDINARY_API_SECRET'] ?? '',
                ],
            ]);
            self::$cloudinary = new CloudinarySdk();
        }
        return self::$cloudinary;
    }

    /**
     * Uploads a file from a temporary path to Cloudinary.
     * @param string $tmpFilePath
     * @param string $originalName
     * @return array Cloudinary upload result
     */
    public static function uploadFile(string $tmpFilePath, string $originalName): array
    {
        $extIdx = strrpos($originalName, '.');
        $baseName = $extIdx !== false ? substr($originalName, 0, $extIdx) : $originalName;
        $cleanName = preg_replace('/[^a-zA-Z0-9-_]/', '_', $baseName);
        $publicId = 'products/' . time() . '_' . $cleanName;

        $cloudinary = self::getInstance();
        
        $result = $cloudinary->uploadApi()->upload($tmpFilePath, [
            'public_id' => $publicId,
            'resource_type' => 'auto',
        ]);

        return (array)$result;
    }
}

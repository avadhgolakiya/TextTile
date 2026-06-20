<?php

namespace App\Routes;

use App\Lib\Auth;
use App\Lib\Cloudinary;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

class UploadRoutes
{
    public static function setup(RouteCollectorProxy $group): void
    {
        $group->post('[/]', function (Request $request, Response $response) {
            $uploadedFiles = $request->getUploadedFiles();
            $file = $uploadedFiles['file'] ?? null;

            if (!$file || $file->getError() !== UPLOAD_ERR_OK) {
                $response->getBody()->write(json_encode(['error' => 'No file uploaded or upload error']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            if ($file->getSize() > 10 * 1024 * 1024) {
                $response->getBody()->write(json_encode(['error' => 'File size exceeds 10MB limit']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $hasCloudinary = !empty($_ENV['CLOUDINARY_CLOUD_NAME']) && $_ENV['CLOUDINARY_CLOUD_NAME'] !== 'your_cloudinary_cloud_name_here';

            if ($hasCloudinary) {
                try {
                    $tmpFilePath = $file->getFilePath();
                    if (!$tmpFilePath) {
                        // Sometimes getFilePath() is null for string-stream uploads in some frameworks
                        // Create a temporary file
                        $tmpFilePath = tempnam(sys_get_temp_dir(), 'upl');
                        $file->moveTo($tmpFilePath);
                    }

                    $result = Cloudinary::uploadFile($tmpFilePath, $file->getClientFilename());
                    $response->getBody()->write(json_encode(['imageUrl' => $result['secure_url']]));
                    return $response->withHeader('Content-Type', 'application/json');
                } catch (\Exception $e) {
                    // Silently fallback to local storage
                }
            }

            // LOCAL SERVER FALLBACK
            $originalName = $file->getClientFilename();
            $ext = pathinfo($originalName, PATHINFO_EXTENSION);
            $ext = $ext ? '.' . $ext : '';
            
            $filename = time() . '_' . bin2hex(random_bytes(16)) . $ext;
            $uploadDir = __DIR__ . '/../../public/uploads';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $filePath = $uploadDir . '/' . $filename;
            $file->moveTo($filePath);

            $imageUrl = '/uploads/' . $filename;

            $response->getBody()->write(json_encode(['imageUrl' => $imageUrl]));
            return $response->withHeader('Content-Type', 'application/json');
        })->add([Auth::class, 'authMiddleware']);
    }
}

import 'dart:io';

import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared service for picking an image from the device gallery and
/// uploading it to a Supabase Storage bucket, returning the public URL.
class ImageUploadService {
  static final _picker = ImagePicker();

  static SupabaseClient get _client => Supabase.instance.client;

  /// Pick one image from the gallery, upload to [bucket], and return its
  /// public URL. Returns `null` if the user cancelled the picker or an
  /// error occurred.
  ///
  /// [bucket] must be a **public** Supabase Storage bucket.
  static Future<String?> pickAndUpload({
    required String bucket,
    int imageQuality = 82,
    ImageSource source = ImageSource.gallery,
  }) async {
    // 1. Pick image
    final picked = await _picker.pickImage(
      source: source,
      imageQuality: imageQuality,
    );
    if (picked == null) return null; // user cancelled

    final file = File(picked.path);
    final ext = picked.path.split('.').last.toLowerCase();
    final fileName =
        '${DateTime.now().millisecondsSinceEpoch}_${picked.name.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_')}';
    final storagePath = fileName;

    // 2. Upload to Supabase Storage
    await _client.storage.from(bucket).upload(
          storagePath,
          file,
          fileOptions: FileOptions(
            contentType: _mimeType(ext),
            upsert: true,
          ),
        );

    // 3. Return public URL
    final url = _client.storage.from(bucket).getPublicUrl(storagePath);
    return url;
  }

  static String _mimeType(String ext) {
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  }
}

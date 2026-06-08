import 'package:supabase_flutter/supabase_flutter.dart';

/// Manages banner images stored in the Supabase `banners` table.
class BannerRepository {
  SupabaseClient get _client => Supabase.instance.client;

  // ── Buyer query ────────────────────────────────────────────────────────────

  /// Returns ordered list of image URLs for the home-screen slider.
  Future<List<String>> fetchUrls() async {
    final rows = await _client
        .from('banners')
        .select('image_url')
        .order('sort_order', ascending: true)
        .order('created_at', ascending: true);
    return (rows as List)
        .map((r) => (r as Map<String, dynamic>)['image_url'] as String)
        .toList();
  }

  // ── Admin queries ──────────────────────────────────────────────────────────

  /// Returns full banner rows (id + image_url + sort_order) for admin management.
  Future<List<Map<String, dynamic>>> fetchAllAdmin() async {
    final rows = await _client
        .from('banners')
        .select('id, image_url, sort_order')
        .order('sort_order', ascending: true)
        .order('created_at', ascending: true);
    return (rows as List).cast<Map<String, dynamic>>();
  }

  /// Add a new banner with an image URL.
  Future<void> add(String imageUrl, {int sortOrder = 0}) async {
    await _client.from('banners').insert({
      'image_url': imageUrl.trim(),
      'sort_order': sortOrder,
    });
  }

  /// Delete a banner by its UUID.
  Future<void> delete(String id) async {
    await _client.from('banners').delete().eq('id', id);
  }
}

import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/cache/product_cache.dart';
import '../../models/product.dart';

/// Fetches and manages products from the Supabase `products` table.
///
/// All buyer-facing reads are wrapped with a 5-minute in-memory [ProductCache]
/// so that navigating between tabs does not fire redundant network requests.
/// Any admin write operation (upsert / delete / setVisibility / setFeatured)
/// calls [ProductCache.invalidate] to keep data fresh.
class ProductRepository {
  SupabaseClient get _client => Supabase.instance.client;
  final _cache = ProductCache.instance;

  // ── Helpers ────────────────────────────────────────────────────────────────

  Product _fromRow(Map<String, dynamic> row) {
    final imageUrl = (row['image_url'] as String?) ?? '';
    final rawUrls =
        (row['image_urls'] as List?)?.map((e) => e.toString()).toList() ??
            <String>[];
    final imageUrls = rawUrls.isNotEmpty
        ? rawUrls
        : (imageUrl.isNotEmpty ? [imageUrl] : <String>[]);
    return Product(
      id: row['id'] as String,
      name: row['name'] as String,
      subtitle: (row['subtitle'] as String?) ?? '',
      price: row['price'] as int,
      originalPrice: row['original_price'] as int?,
      imageUrl: imageUrl,
      imageUrls: imageUrls,
      badge: row['badge'] as String?,
      categoryKey: row['category_key'] as String?,
      isVisible: (row['is_visible'] as bool?) ?? true,
    );
  }

  Map<String, dynamic> _toRow(Product p, {bool isFeatured = false}) {
    final primaryUrl = p.imageUrls.isNotEmpty ? p.imageUrls.first : p.imageUrl;
    return {
      'id': p.id,
      'name': p.name,
      'subtitle': p.subtitle,
      'price': p.price,
      if (p.originalPrice != null) 'original_price': p.originalPrice,
      'image_url': primaryUrl,
      'image_urls': p.imageUrls,
      if (p.badge != null) 'badge': p.badge,
      if (p.categoryKey != null) 'category_key': p.categoryKey,
      'is_featured': isFeatured,
      'is_visible': p.isVisible,
    };
  }

  // ── Buyer queries ──────────────────────────────────────────────────────────

  /// All visible products — used by Collection tab.
  /// Returns cached data (up to 5 min old) to avoid redundant round-trips.
  Future<List<Product>> fetchAll() async {
    if (_cache.allValid) return _cache.all!;
    final rows = await _client
        .from('products')
        .select()
        .eq('is_visible', true)
        .order('created_at', ascending: false);
    final products =
        (rows as List).map((r) => _fromRow(r as Map<String, dynamic>)).toList();
    _cache.setAll(products);
    return products;
  }

  /// Featured visible products — used by Today's Drop tab.
  /// Returns cached data (up to 5 min old) to avoid redundant round-trips.
  Future<List<Product>> fetchFeatured() async {
    if (_cache.featuredValid) return _cache.featured!;
    final rows = await _client
        .from('products')
        .select()
        .eq('is_featured', true)
        .eq('is_visible', true)
        .order('created_at', ascending: false);
    final products =
        (rows as List).map((r) => _fromRow(r as Map<String, dynamic>)).toList();
    _cache.setFeatured(products);
    return products;
  }

  /// Visible products filtered by category.
  Future<List<Product>> fetchByCategory(String categoryKey) async {
    final rows = await _client
        .from('products')
        .select()
        .eq('category_key', categoryKey.trim().toLowerCase())
        .eq('is_visible', true)
        .order('created_at', ascending: false);
    return (rows as List)
        .map((r) => _fromRow(r as Map<String, dynamic>))
        .toList();
  }

  // ── Admin CRUD ─────────────────────────────────────────────────────────────

  /// Admin-only: fetch ALL products (visible + hidden).
  Future<List<Product>> fetchAllAdmin() async {
    final rows = await _client
        .from('products')
        .select()
        .order('created_at', ascending: false);
    return (rows as List)
        .map((r) => _fromRow(r as Map<String, dynamic>))
        .toList();
  }

  /// Insert or update a product, then invalidate buyer-facing cache.
  Future<void> upsert(Product product, {bool isFeatured = false}) async {
    await _client
        .from('products')
        .upsert(_toRow(product, isFeatured: isFeatured));
    _cache.invalidate();
  }

  /// Delete a product by ID, then invalidate buyer-facing cache.
  Future<void> delete(String id) async {
    await _client.from('products').delete().eq('id', id);
    _cache.invalidate();
  }

  /// Toggle the is_featured flag, then invalidate cache.
  Future<void> setFeatured(String id, {required bool featured}) async {
    await _client
        .from('products')
        .update({'is_featured': featured}).eq('id', id);
    _cache.invalidate();
  }

  /// Toggle the is_visible flag, then invalidate cache.
  Future<void> setVisibility(String id, {required bool visible}) async {
    await _client
        .from('products')
        .update({'is_visible': visible}).eq('id', id);
    _cache.invalidate();
  }
}

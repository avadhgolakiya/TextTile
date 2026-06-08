import '../../models/product.dart';

/// Simple in-memory TTL cache for product lists fetched from Supabase.
///
/// Eliminates redundant network round-trips when the user navigates between
/// tabs or reopens screens within a short window. The cache is invalidated
/// after any admin write operation (upsert / delete / setVisibility).
///
/// Usage:
/// ```dart
/// final cache = ProductCache.instance;
/// if (cache.allValid) return cache.all!;
/// final fresh = await _client.from('products')...;
/// cache.setAll(fresh);
/// ```
class ProductCache {
  ProductCache._();
  static final ProductCache instance = ProductCache._();

  static const Duration _ttl = Duration(minutes: 5);

  List<Product>? _all;
  DateTime? _allFetchedAt;

  List<Product>? _featured;
  DateTime? _featuredFetchedAt;

  // ── All products ──────────────────────────────────────────────────────────

  bool get allValid =>
      _all != null &&
      _allFetchedAt != null &&
      DateTime.now().difference(_allFetchedAt!) < _ttl;

  List<Product>? get all => allValid ? _all : null;

  void setAll(List<Product> products) {
    _all = products;
    _allFetchedAt = DateTime.now();
  }

  // ── Featured products ─────────────────────────────────────────────────────

  bool get featuredValid =>
      _featured != null &&
      _featuredFetchedAt != null &&
      DateTime.now().difference(_featuredFetchedAt!) < _ttl;

  List<Product>? get featured => featuredValid ? _featured : null;

  void setFeatured(List<Product> products) {
    _featured = products;
    _featuredFetchedAt = DateTime.now();
  }

  // ── Invalidation ──────────────────────────────────────────────────────────

  /// Call after any admin write (upsert, delete, setVisibility, setFeatured).
  void invalidate() {
    _all = null;
    _allFetchedAt = null;
    _featured = null;
    _featuredFetchedAt = null;
  }
}

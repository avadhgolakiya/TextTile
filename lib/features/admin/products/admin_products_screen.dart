import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/constants/app_colors.dart';
import '../../../models/product.dart';
import '../../catalog/product_repository.dart';
import 'admin_product_form_screen.dart';

/// Admin — manage the product catalogue with live Supabase CRUD.
/// Holds data in-memory; CRUD operations update the list locally first
/// (optimistic) so the UI never blocks waiting for a network re-fetch.
class AdminProductsScreen extends StatefulWidget {
  const AdminProductsScreen({super.key});
  @override
  State<AdminProductsScreen> createState() => _AdminProductsScreenState();
}

class _AdminProductsScreenState extends State<AdminProductsScreen> {
  final _repo = ProductRepository();
  List<Product>? _products;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await _repo.fetchAllAdmin();
      if (mounted) setState(() { _products = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _openForm({Product? product, bool isFeatured = false}) async {
    final result = await Navigator.of(context).push<Map<String, dynamic>?>(
      MaterialPageRoute(
        builder: (_) => AdminProductFormScreen(
          product: product, initialFeatured: isFeatured),
      ),
    );
    if (result == null) return;
    final p = result['product'] as Product;
    final featured = result['featured'] as bool;
    try {
      await _repo.upsert(p, isFeatured: featured);
      if (mounted) {
        // Optimistic: update or insert in-memory list
        setState(() {
          final idx = _products?.indexWhere((x) => x.id == p.id) ?? -1;
          if (idx >= 0) {
            _products![idx] = p;
          } else {
            _products = [p, ...?_products];
          }
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(product == null ? '${p.name} added!' : '${p.name} updated!'),
          backgroundColor: AppColors.maroon,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
      }
    }
  }

  void _delete(Product product) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Delete product?',
            style: GoogleFonts.playfairDisplay(fontWeight: FontWeight.w700)),
        content: Text('${product.name} will be permanently removed.',
            style: GoogleFonts.poppins(fontSize: 14)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('Cancel', style: GoogleFonts.poppins())),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red.shade700),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await _repo.delete(product.id);
                if (mounted) {
                  // Optimistic: remove from in-memory list
                  setState(() => _products?.removeWhere((p) => p.id == product.id));
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('${product.name} deleted')));
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Delete failed: $e'), backgroundColor: Colors.red));
                }
              }
            },
            child: Text('Delete', style: GoogleFonts.poppins()),
          ),
        ],
      ),
    );
  }

  void _toggleVisibility(Product product) async {
    final newVisibility = !product.isVisible;
    // Optimistic: flip flag in-memory immediately
    final idx = _products?.indexWhere((p) => p.id == product.id) ?? -1;
    if (idx < 0) return;
    final updated = Product(
      id: product.id, name: product.name, subtitle: product.subtitle,
      price: product.price, originalPrice: product.originalPrice,
      imageUrl: product.imageUrl, imageUrls: product.imageUrls,
      badge: product.badge, categoryKey: product.categoryKey,
      isVisible: newVisibility,
    );
    setState(() => _products![idx] = updated);

    try {
      await _repo.setVisibility(product.id, visible: newVisibility);
      if (mounted) {
        final msg = newVisibility
            ? '${product.name} is now visible'
            : '${product.name} hidden from buyers';
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Row(children: [
            Icon(newVisibility ? Icons.visibility : Icons.visibility_off,
                color: Colors.white, size: 18),
            const SizedBox(width: 10),
            Expanded(child: Text(msg, style: GoogleFonts.poppins())),
          ]),
          backgroundColor:
              newVisibility ? Colors.green.shade700 : Colors.grey.shade700,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ));
      }
    } catch (e) {
      // Roll back on failure
      if (mounted) {
        setState(() => _products![idx] = product);
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.maroon,
        onPressed: () => _openForm(),
        icon: const Icon(Icons.add, color: AppColors.white),
        label: Text('Add Product',
            style: GoogleFonts.poppins(color: AppColors.white, fontWeight: FontWeight.w600)),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.error_outline, size: 48, color: AppColors.textSecondary),
        const SizedBox(height: 12),
        Text('Failed to load products',
            style: GoogleFonts.poppins(color: AppColors.textSecondary)),
        TextButton(
            onPressed: _loadProducts,
            child: Text('Retry', style: GoogleFonts.poppins(color: AppColors.maroon))),
      ]));
    }
    final products = _products ?? [];
    if (products.isEmpty) {
      return Center(child: Text('No products yet. Tap + to add.',
          style: GoogleFonts.poppins(color: AppColors.textSecondary)));
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: products.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) => _ProductTile(
        product: products[i],
        onEdit: () => _openForm(product: products[i]),
        onDelete: () => _delete(products[i]),
        onToggleVisibility: () => _toggleVisibility(products[i]),
      ),
    );
  }
}

class _ProductTile extends StatelessWidget {
  const _ProductTile({
    required this.product,
    required this.onEdit,
    required this.onDelete,
    required this.onToggleVisibility,
  });

  final Product product;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onToggleVisibility;

  @override
  Widget build(BuildContext context) {
    final isHidden = !product.isVisible;
    return Stack(children: [
      AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        decoration: BoxDecoration(
          color: isHidden ? Colors.grey.shade100 : AppColors.white,
          borderRadius: BorderRadius.circular(18),
          border: isHidden ? Border.all(color: Colors.grey.shade300, width: 1.5) : null,
          boxShadow: [BoxShadow(
              color: Colors.black.withValues(alpha: isHidden ? 0.03 : 0.05),
              blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          leading: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 52, height: 52,
              child: ColorFiltered(
                colorFilter: isHidden
                    ? const ColorFilter.matrix(<double>[
                        0.2126, 0.7152, 0.0722, 0, 0,
                        0.2126, 0.7152, 0.0722, 0, 0,
                        0.2126, 0.7152, 0.0722, 0, 0,
                        0,      0,      0,      1, 0,
                      ])
                    : const ColorFilter.mode(Colors.transparent, BlendMode.multiply),
                child: product.imageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: product.imageUrl,
                        fit: BoxFit.cover,
                        memCacheWidth: 104,
                        placeholder: (_, __) => Container(color: AppColors.peach),
                        errorWidget: (_, __, ___) => Container(color: AppColors.peach),
                      )
                    : Container(
                        color: AppColors.peach,
                        child: const Icon(Icons.image_not_supported_outlined,
                            color: AppColors.textSecondary)),
              ),
            ),
          ),
          title: Text(product.name,
              style: GoogleFonts.poppins(
                  fontWeight: FontWeight.w600, fontSize: 14,
                  color: isHidden ? AppColors.textSecondary : null)),
          subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Code: ${product.id}  ·  ₹${product.price}',
                style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
            if (isHidden) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                    color: Colors.grey.shade300, borderRadius: BorderRadius.circular(6)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.visibility_off_outlined, size: 12, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text('Hidden from public',
                      style: GoogleFonts.poppins(
                          fontSize: 11, color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
                ]),
              ),
            ],
          ]),
          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
            Tooltip(
              message: isHidden ? 'Show to public' : 'Hide from public',
              child: IconButton(
                icon: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  child: Icon(
                    isHidden ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    key: ValueKey(isHidden),
                    color: isHidden ? Colors.grey.shade500 : Colors.green.shade600,
                  ),
                ),
                onPressed: onToggleVisibility,
              ),
            ),
            IconButton(
                icon: const Icon(Icons.edit_outlined, color: AppColors.maroon),
                onPressed: onEdit),
            IconButton(
                icon: Icon(Icons.delete_outline, color: Colors.red.shade700),
                onPressed: onDelete),
          ]),
        ),
      ),
    ]);
  }
}

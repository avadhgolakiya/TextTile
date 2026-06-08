import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../models/product.dart';
import '../../widgets/product_card.dart';
import 'product_detail_screen.dart';
import 'product_repository.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({
    super.key,
    required this.title,
    this.categoryLabel,
  });

  final String title;
  final String? categoryLabel;

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final _repo = ProductRepository();
  late Future<List<Product>> _future;

  @override
  void initState() {
    super.initState();
    final cat = widget.categoryLabel;
    _future = (cat == null || cat.trim().isEmpty)
        ? _repo.fetchAll()
        : _repo.fetchByCategory(cat);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.title,
          style: GoogleFonts.playfairDisplay(
              fontWeight: FontWeight.w700, fontSize: 22),
        ),
      ),
      body: FutureBuilder<List<Product>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final items = snap.data ?? [];
          if (items.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  'No products here yet.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                      color: AppColors.textSecondary, fontSize: 15),
                ),
              ),
            );
          }
          return LayoutBuilder(builder: (context, c) {
            final cross = c.maxWidth >= 700 ? 3 : 2;
            return GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: cross,
                mainAxisSpacing: 16,
                crossAxisSpacing: 14,
                childAspectRatio: 0.62,
              ),
              itemCount: items.length,
              itemBuilder: (context, i) {
                final p = items[i];
                return ProductCard(
                  product: p,
                  onTap: () => Navigator.of(context).push<void>(
                    MaterialPageRoute<void>(
                        builder: (_) => ProductDetailScreen(product: p)),
                  ),
                );
              },
            );
          });
        },
      ),
    );
  }
}

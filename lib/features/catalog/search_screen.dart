import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../models/product.dart';
import 'product_detail_screen.dart';
import 'product_repository.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  final _repo = ProductRepository();

  String _query = '';
  List<Product> _allProducts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _repo.fetchAll().then((list) {
      if (mounted) setState(() { _allProducts = list; _loading = false; });
    }).catchError((_) {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  List<Product> get _results {
    final q = _query.trim().toLowerCase();
    if (q.isEmpty) return _allProducts;
    return _allProducts.where((p) {
      return p.name.toLowerCase().contains(q) ||
          p.id.toLowerCase().contains(q) ||
          p.subtitle.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final results = _results;
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: TextField(
          controller: _controller,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search sarees, fabric, code…',
            border: InputBorder.none,
            hintStyle: GoogleFonts.poppins(color: AppColors.textSecondary),
          ),
          style: GoogleFonts.poppins(fontSize: 16),
          onChanged: (v) => setState(() => _query = v),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : results.isEmpty
              ? Center(
                  child: Text(
                    _query.isEmpty
                        ? 'No products available yet.'
                        : 'No matches for "$_query"',
                    style: GoogleFonts.poppins(color: AppColors.textSecondary),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  itemCount: results.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final p = results[i];
                    return SizedBox(
                      height: 132,
                      child: InkWell(
                        onTap: () => Navigator.of(context).push<void>(
                          MaterialPageRoute<void>(
                              builder: (_) => ProductDetailScreen(product: p)),
                        ),
                        borderRadius: BorderRadius.circular(20),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Image.network(
                                p.imageUrl,
                                width: 100,
                                height: 132,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                    width: 100,
                                    height: 132,
                                    color: AppColors.peach),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p.id,
                                      style: GoogleFonts.poppins(
                                          fontSize: 11,
                                          color: AppColors.textSecondary)),
                                  const SizedBox(height: 4),
                                  Text(p.name,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.playfairDisplay(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w700)),
                                  const Spacer(),
                                  Text(p.subtitle,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.poppins(
                                          fontSize: 12,
                                          color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                            const Icon(Icons.chevron_right,
                                color: AppColors.textSecondary),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}

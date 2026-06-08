import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../models/product.dart';
import '../../widgets/product_card.dart';
import '../catalog/product_detail_screen.dart';
import '../catalog/product_repository.dart';

class CollectionScreen extends StatefulWidget {
  const CollectionScreen({super.key});

  @override
  State<CollectionScreen> createState() => _CollectionScreenState();
}

class _CollectionScreenState extends State<CollectionScreen> {
  final _repo = ProductRepository();
  late Future<List<Product>> _future;
  String _selected = 'All';

  static const _filters = [
    'All', 'Sarees', 'Suits', 'Lehenga', 'Fabric', 'Dupatta',
  ];

  @override
  void initState() {
    super.initState();
    _future = _repo.fetchAll();
  }

  void _refresh() => setState(() => _future = _repo.fetchAll());

  List<Product> _filtered(List<Product> items) {
    if (_selected == 'All') return items;
    return items
        .where((p) =>
            p.name.toLowerCase().contains(_selected.toLowerCase()) ||
            (p.subtitle.toLowerCase().contains(_selected.toLowerCase())))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    const pad = 20.0;
    final top = MediaQuery.paddingOf(context).top;

    return FutureBuilder<List<Product>>(
      future: _future,
      builder: (context, snap) {
        final items = _filtered(snap.data ?? []);
        final isLoading = snap.connectionState == ConnectionState.waiting;

        return CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // ── Header ────────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Container(
                padding: EdgeInsets.fromLTRB(pad, top + 16, pad, 22),
                decoration: const BoxDecoration(
                  gradient: AppColors.heroGradient,
                  borderRadius:
                      BorderRadius.vertical(bottom: Radius.circular(32)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SWASTIK FASHION',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        letterSpacing: 2.5,
                        color: AppColors.gold.withValues(alpha: 0.85),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    ShaderMask(
                      shaderCallback: (r) => const LinearGradient(
                        colors: [AppColors.white, AppColors.goldPale],
                      ).createShader(r),
                      child: Text(
                        'Collection',
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 34,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${snap.data?.length ?? 0} products',
                      style: GoogleFonts.poppins(
                        color: AppColors.white.withValues(alpha: 0.6),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Filter chips ──────────────────────────────────────────────
            SliverToBoxAdapter(
              child: SizedBox(
                height: 52,
                child: ListView.separated(
                  padding:
                      const EdgeInsets.symmetric(horizontal: pad, vertical: 6),
                  scrollDirection: Axis.horizontal,
                  itemCount: _filters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    final f = _filters[i];
                    final active = f == _selected;
                    return GestureDetector(
                      onTap: () => setState(() => _selected = f),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 18, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: active ? AppColors.maroonGradient : null,
                          color: active ? null : AppColors.white,
                          borderRadius: BorderRadius.circular(99),
                          border: Border.all(
                            color: active
                                ? Colors.transparent
                                : AppColors.divider,
                          ),
                          boxShadow: active
                              ? [
                                  BoxShadow(
                                    color: AppColors.maroon
                                        .withValues(alpha: 0.25),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ]
                              : [],
                        ),
                        child: Text(
                          f,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: active
                                ? AppColors.white
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // ── Loading ───────────────────────────────────────────────────
            if (isLoading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              )

            // ── Error ─────────────────────────────────────────────────────
            else if (snap.hasError)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.wifi_off_rounded,
                          size: 56,
                          color: AppColors.textSecondary
                              .withValues(alpha: 0.4)),
                      const SizedBox(height: 14),
                      Text('Could not load products',
                          style: GoogleFonts.poppins(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500)),
                      const SizedBox(height: 14),
                      FilledButton(
                        onPressed: _refresh,
                        child: const Text('Try again'),
                      ),
                    ],
                  ),
                ),
              )

            // ── Products grid ─────────────────────────────────────────────
            else if (items.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.search_off_rounded,
                          size: 56,
                          color: AppColors.textSecondary
                              .withValues(alpha: 0.4)),
                      const SizedBox(height: 14),
                      Text('No products in "$_selected"',
                          style: GoogleFonts.poppins(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              )

            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(pad, 8, pad, 0),
                sliver: SliverGrid.builder(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount:
                        MediaQuery.sizeOf(context).width >= 700 ? 3 : 2,
                    mainAxisSpacing: 22,
                    crossAxisSpacing: 14,
                    childAspectRatio: 0.60,
                  ),
                  itemCount: items.length,
                  itemBuilder: (context, i) {
                    final p = items[i];
                    return ProductCard(
                      product: p,
                      onTap: () => Navigator.of(context).push<void>(
                        MaterialPageRoute<void>(
                          builder: (_) => ProductDetailScreen(product: p),
                        ),
                      ),
                    );
                  },
                ),
              ),

            const SliverToBoxAdapter(child: SizedBox(height: 110)),
          ],
        );
      },
    );
  }
}

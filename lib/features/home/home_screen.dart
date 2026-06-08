import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../data/sample_data.dart';
import '../../models/product.dart';
import '../catalog/banner_repository.dart';
import '../catalog/product_detail_screen.dart';
import '../catalog/product_list_screen.dart';
import '../catalog/product_repository.dart';
import '../catalog/search_screen.dart';
import '../../widgets/category_item.dart';
import '../../widgets/product_card.dart';
import '../../widgets/promo_banner.dart';
import '../../widgets/section_header.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  final _repo = ProductRepository();
  final _bannerRepo = BannerRepository();
  late Future<List<Product>> _todaysDrop;
  late Future<List<Product>> _allProducts;
  late Future<List<String>> _bannerUrls;

  late AnimationController _headerCtrl;
  late Animation<double> _headerFade;
  late Animation<Offset> _headerSlide;

  @override
  void initState() {
    super.initState();
    _todaysDrop = _repo.fetchFeatured();
    _allProducts = _repo.fetchAll();
    _bannerUrls = _bannerRepo.fetchUrls();

    _headerCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _headerFade = CurvedAnimation(parent: _headerCtrl, curve: Curves.easeOut);
    _headerSlide = Tween<Offset>(
      begin: const Offset(0, -0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _headerCtrl, curve: Curves.easeOut));
    _headerCtrl.forward();
  }

  @override
  void dispose() {
    _headerCtrl.dispose();
    super.dispose();
  }

  void _refresh() {
    setState(() {
      _todaysDrop = _repo.fetchFeatured();
      _allProducts = _repo.fetchAll();
      _bannerUrls = _bannerRepo.fetchUrls();
    });
  }

  @override
  Widget build(BuildContext context) {
    final pad = _horizontalPadding(context);
    final topInset = MediaQuery.paddingOf(context).top;

    return RefreshIndicator(
      color: AppColors.gold,
      backgroundColor: AppColors.white,
      onRefresh: () async {
        _refresh();
        await Future.wait([_todaysDrop, _allProducts, _bannerUrls]);
      },
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ── Gradient header ──────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _GradientHeader(
              topInset: topInset,
              pad: pad,
              fadeAnim: _headerFade,
              slideAnim: _headerSlide,
              onSearchTap: () => Navigator.of(context).push<void>(
                MaterialPageRoute<void>(builder: (_) => const SearchScreen()),
              ),
            ),
          ),

          // ── Promo banner ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(pad, 0, pad, 0),
              child: FutureBuilder<List<String>>(
                future: _bannerUrls,
                builder: (context, snap) {
                  final urls = snap.data ?? [];
                  final display = urls.isEmpty &&
                          snap.connectionState != ConnectionState.done
                      ? [SampleData.bannerFabric]
                      : urls;
                  return PromoBanner(imageUrls: display);
                },
              ),
            ),
          ),

          // ── Today's Drop ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(pad, 32, pad, 0),
              child: SectionHeader(
                title: "Today's Drop",
                actionLabel: 'See all',
                onAction: () => Navigator.of(context).push<void>(
                  MaterialPageRoute<void>(
                      builder: (_) =>
                          const ProductListScreen(title: "Today's Drop")),
                ),
                leading: ShaderMask(
                  shaderCallback: (r) =>
                      AppColors.maroonGradient.createShader(r),
                  child: const Icon(Icons.local_fire_department_rounded,
                      color: AppColors.white, size: 22),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: FutureBuilder<List<Product>>(
              future: _todaysDrop,
              builder: (context, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return _ProductRowSkeleton(pad: pad);
                }
                final items = snap.data ?? [];
                if (items.isEmpty) {
                  return _emptyDrop(pad);
                }
                return _ProductHorizontalList(
                    items: items, pad: pad, onTap: _openProductDetail);
              },
            ),
          ),

          // ── Categories ───────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(pad, 32, pad, 0),
              child: SectionHeader(
                title: 'Categories',
                actionLabel: 'View all',
                onAction: () => Navigator.of(context).push<void>(
                  MaterialPageRoute<void>(
                      builder: (_) => const ProductListScreen(title: 'Catalog')),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 112,
              child: ListView.separated(
                padding: EdgeInsets.symmetric(horizontal: pad),
                scrollDirection: Axis.horizontal,
                itemCount: SampleData.categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, i) {
                  final c = SampleData.categories[i];
                  return CategoryItem(
                    icon: c.icon,
                    label: c.label,
                    colorIndex: i,
                    onTap: () => Navigator.of(context).push<void>(
                      MaterialPageRoute<void>(
                          builder: (_) => ProductListScreen(
                              title: c.label, categoryLabel: c.label)),
                    ),
                  );
                },
              ),
            ),
          ),

          // ── New Arrivals ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(pad, 32, pad, 0),
              child: SectionHeader(
                title: 'New Arrivals',
                actionLabel: 'See all',
                onAction: () => Navigator.of(context).push<void>(
                  MaterialPageRoute<void>(
                      builder: (_) =>
                          const ProductListScreen(title: 'New Arrivals')),
                ),
                leading: ShaderMask(
                  shaderCallback: (r) =>
                      AppColors.goldGradient.createShader(r),
                  child: const Icon(Icons.auto_awesome_rounded,
                      color: AppColors.white, size: 20),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: FutureBuilder<List<Product>>(
              future: _allProducts,
              builder: (context, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return _ProductRowSkeleton(pad: pad);
                }
                final items = snap.data ?? [];
                return _ProductHorizontalList(
                    items: items, pad: pad, onTap: _openProductDetail);
              },
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 110)),
        ],
      ),
    );
  }

  Widget _emptyDrop(double pad) => Padding(
        padding: EdgeInsets.fromLTRB(pad, 8, pad, 0),
        child: Container(
          height: 90,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.peach,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            'No featured products yet.\nAdmin can pin products to Today\'s Drop.',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
                color: AppColors.textSecondary, fontSize: 13),
          ),
        ),
      );

  double _horizontalPadding(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    if (w >= 600) return 32;
    if (w >= 400) return 20;
    return 16;
  }
}

void _openProductDetail(BuildContext context, Product product) {
  Navigator.of(context).push<void>(
    MaterialPageRoute<void>(
      builder: (_) => ProductDetailScreen(product: product),
    ),
  );
}

// ── Gradient header ──────────────────────────────────────────────────────────
class _GradientHeader extends StatelessWidget {
  const _GradientHeader({
    required this.topInset,
    required this.pad,
    required this.fadeAnim,
    required this.slideAnim,
    required this.onSearchTap,
  });

  final double topInset;
  final double pad;
  final Animation<double> fadeAnim;
  final Animation<Offset> slideAnim;
  final VoidCallback onSearchTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.heroGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(36)),
      ),
      padding: EdgeInsets.fromLTRB(pad, topInset + 20, pad, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Brand row ────────────────────────────────────────────────────
          FadeTransition(
            opacity: fadeAnim,
            child: SlideTransition(
              position: slideAnim,
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'NAMASTE 🙏',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            letterSpacing: 2,
                            color: AppColors.gold.withValues(alpha: 0.85),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        ShaderMask(
                          shaderCallback: (r) =>
                              const LinearGradient(colors: [
                            AppColors.white,
                            AppColors.goldPale,
                          ]).createShader(r),
                          child: Text(
                            'Swastik Fashion',
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 30,
                              fontWeight: FontWeight.w700,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Notification bell placeholder
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.glass,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.glassBorder),
                    ),
                    child: const Icon(Icons.notifications_outlined,
                        color: AppColors.white, size: 22),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ── Glassmorphism search bar ──────────────────────────────────────
          GestureDetector(
            onTap: onSearchTap,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.white.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: AppColors.white.withValues(alpha: 0.25)),
              ),
              child: Row(
                children: [
                  Icon(Icons.search_rounded,
                      color: AppColors.white.withValues(alpha: 0.7), size: 20),
                  const SizedBox(width: 10),
                  Text(
                    'Search sarees, fabric, code…',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: AppColors.white.withValues(alpha: 0.65),
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.tune_rounded,
                      color: AppColors.white.withValues(alpha: 0.6), size: 18),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Horizontal product list ───────────────────────────────────────────────────
class _ProductHorizontalList extends StatelessWidget {
  const _ProductHorizontalList({
    required this.items,
    required this.pad,
    required this.onTap,
  });

  final List<Product> items;
  final double pad;
  final void Function(BuildContext, Product) onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 330,
      child: LayoutBuilder(builder: (context, c) {
        final cardW = (c.maxWidth * 0.42).clamp(150.0, 190.0);
        return ListView.separated(
          padding: EdgeInsets.fromLTRB(pad, 4, pad, 4),
          scrollDirection: Axis.horizontal,
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 16),
          itemBuilder: (context, i) => ProductCard(
            product: items[i],
            width: cardW,
            onTap: () => onTap(context, items[i]),
          ),
        );
      }),
    );
  }
}

// ── Shimmer skeleton loader ───────────────────────────────────────────────────
class _ProductRowSkeleton extends StatefulWidget {
  const _ProductRowSkeleton({required this.pad});
  final double pad;

  @override
  State<_ProductRowSkeleton> createState() => _ProductRowSkeletonState();
}

class _ProductRowSkeletonState extends State<_ProductRowSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 330,
      child: AnimatedBuilder(
        animation: _anim,
        builder: (_, __) => ListView.separated(
          padding: EdgeInsets.symmetric(horizontal: widget.pad),
          scrollDirection: Axis.horizontal,
          itemCount: 4,
          separatorBuilder: (_, __) => const SizedBox(width: 16),
          itemBuilder: (_, __) => SizedBox(
            width: 164,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 236,
                  decoration: BoxDecoration(
                    color: AppColors.peach
                        .withValues(alpha: _anim.value),
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  height: 10,
                  width: 60,
                  decoration: BoxDecoration(
                    color: AppColors.divider
                        .withValues(alpha: _anim.value),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  height: 14,
                  width: 120,
                  decoration: BoxDecoration(
                    color: AppColors.divider
                        .withValues(alpha: _anim.value),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  height: 14,
                  width: 80,
                  decoration: BoxDecoration(
                    color: AppColors.divider
                        .withValues(alpha: _anim.value),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import '../../core/formatting/inr_format.dart';
import '../../models/product.dart';
import 'app_network_image.dart';

class ProductCard extends StatefulWidget {
  const ProductCard({
    super.key,
    required this.product,
    this.width,
    this.showPricing = true,
    this.onTap,
  });

  final Product product;
  final double? width;
  final bool showPricing;
  final VoidCallback? onTap;

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
    );
    _scale = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Widget _badge() {
    final badge = widget.product.badge;
    if (badge == null) return const SizedBox.shrink();

    final isNew = badge.toLowerCase().contains('new');
    final isHot = badge.toLowerCase().contains('hot') ||
        badge.toLowerCase().contains('fire');

    return Positioned(
      left: 10,
      top: 10,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          gradient: isNew
              ? AppColors.goldGradient
              : isHot
                  ? AppColors.maroonGradient
                  : const LinearGradient(
                      colors: [Color(0xFF4A148C), Color(0xFF7B1FA2)]),
          borderRadius: BorderRadius.circular(99),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.18),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          badge.toUpperCase(),
          style: GoogleFonts.poppins(
            fontSize: 9.5,
            fontWeight: FontWeight.w800,
            color: AppColors.white,
            letterSpacing: 0.6,
          ),
        ),
      ),
    );
  }

  Widget _discountBadge() {
    final orig = widget.product.originalPrice;
    final curr = widget.product.price;
    if (orig == null || orig <= curr) return const SizedBox.shrink();
    final pct = (((orig - curr) / orig) * 100).round();
    return Positioned(
      right: 10,
      top: 10,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: AppColors.maroon,
          borderRadius: BorderRadius.circular(99),
        ),
        child: Text(
          '-$pct%',
          style: GoogleFonts.poppins(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: AppColors.white,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final w = widget.width ?? 168.0;
    final product = widget.product;

    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) {
        _ctrl.reverse();
        widget.onTap?.call();
      },
      onTapCancel: () => _ctrl.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: SizedBox(
          width: w,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Image container ────────────────────────────────────────
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.maroon.withValues(alpha: 0.12),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      AppNetworkImage(
                        url: product.imageUrl,
                        fit: BoxFit.cover,
                        borderRadius: BorderRadius.circular(24),
                        aspectRatio: 0.72,
                      ),
                      // Subtle bottom gradient for depth
                      Positioned.fill(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.18),
                              ],
                              stops: const [0.6, 1.0],
                            ),
                          ),
                        ),
                      ),
                      _badge(),
                      _discountBadge(),
                    ],
                  ),
                ),
              ),

              // ── Meta block ──────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.only(top: 12, left: 4, right: 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      product.id,
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        color: AppColors.textHint,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    if (widget.showPricing) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            formatInr(product.price),
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.maroon,
                            ),
                          ),
                          if (product.originalPrice != null) ...[
                            const SizedBox(width: 6),
                            Text(
                              formatInr(product.originalPrice!),
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: AppColors.textHint,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/constants/app_colors.dart';

/// Auto-scrolling cinematic banner slider.
class PromoBanner extends StatefulWidget {
  const PromoBanner({
    super.key,
    required this.imageUrls,
    this.height,
    this.autoScrollDuration = const Duration(seconds: 4),
  });

  final List<String> imageUrls;
  final double? height;
  final Duration autoScrollDuration;

  @override
  State<PromoBanner> createState() => _PromoBannerState();
}

class _PromoBannerState extends State<PromoBanner> {
  late final PageController _controller;
  int _page = 0;
  Timer? _timer;

  static const int _kVirtualStart = 10000;

  @override
  void initState() {
    super.initState();
    _controller = PageController(initialPage: _kVirtualStart);
    _startAutoScroll();
  }

  void _startAutoScroll() {
    _timer?.cancel();
    if (widget.imageUrls.length <= 1) return;
    _timer = Timer.periodic(widget.autoScrollDuration, (_) {
      if (!mounted) return;
      _controller.nextPage(
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void didUpdateWidget(covariant PromoBanner old) {
    super.didUpdateWidget(old);
    if (old.imageUrls.length != widget.imageUrls.length) {
      _startAutoScroll();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.sizeOf(context);
    final h = widget.height ?? (mq.width * 0.52).clamp(200.0, 280.0);
    final urls = widget.imageUrls;

    // ── Placeholder ────────────────────────────────────────────────────────
    if (urls.isEmpty) {
      return _buildPlaceholder(h);
    }

    // ── Slider ─────────────────────────────────────────────────────────────
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: Container(
        height: h,
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: AppColors.maroon.withValues(alpha: 0.18),
              blurRadius: 24,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // ── Page view ─────────────────────────────────────────────────
            PageView.builder(
              controller: _controller,
              onPageChanged: (i) => setState(() => _page = i % urls.length),
              itemBuilder: (_, i) {
                final url = urls[i % urls.length];
                return Image.network(
                  url,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _errorPlaceholder(),
                  loadingBuilder: (_, child, progress) {
                    if (progress == null) return child;
                    return _loadingPlaceholder();
                  },
                );
              },
            ),

            // ── Cinematic gradient overlay ─────────────────────────────────
            const Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Color(0x00000000),
                      Color(0x33000000),
                      Color(0xBB000000),
                    ],
                    stops: [0.3, 0.65, 1.0],
                  ),
                ),
              ),
            ),

            // ── Editorial label + dots ─────────────────────────────────────
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 0, 18, 16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    // Label
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        gradient: AppColors.goldGradient,
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: Text(
                        'NEW COLLECTION',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppColors.white,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    const Spacer(),
                    // Dot indicators
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(urls.length, (i) {
                        final active = i == _page;
                        return GestureDetector(
                          onTap: () {
                            final current =
                                (_controller.page ?? _kVirtualStart.toDouble())
                                    .round();
                            final offset = i - (current % urls.length);
                            _controller.animateToPage(
                              current + offset,
                              duration: const Duration(milliseconds: 400),
                              curve: Curves.easeInOut,
                            );
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            height: 6,
                            width: active ? 22 : 6,
                            decoration: BoxDecoration(
                              color: active
                                  ? AppColors.gold
                                  : AppColors.white.withValues(alpha: 0.55),
                              borderRadius: BorderRadius.circular(99),
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder(double h) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: Container(
        height: h,
        decoration: const BoxDecoration(gradient: AppColors.maroonGradient),
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.photo_library_outlined,
                size: 48, color: AppColors.white.withValues(alpha: 0.5)),
            const SizedBox(height: 10),
            Text(
              'No banners yet',
              style: GoogleFonts.poppins(
                color: AppColors.white.withValues(alpha: 0.7),
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _loadingPlaceholder() => Container(
        decoration: const BoxDecoration(gradient: AppColors.maroonGradient),
        alignment: Alignment.center,
        child: SizedBox(
          width: 28,
          height: 28,
          child: CircularProgressIndicator(
            strokeWidth: 2.5,
            color: AppColors.gold.withValues(alpha: 0.9),
          ),
        ),
      );

  Widget _errorPlaceholder() => Container(
        decoration: const BoxDecoration(gradient: AppColors.maroonGradient),
        alignment: Alignment.center,
        child: Icon(Icons.broken_image_outlined,
            color: AppColors.white.withValues(alpha: 0.4), size: 40),
      );
}

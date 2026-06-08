import 'dart:async';
import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gal/gal.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../cart/cart_context.dart';
import '../../core/constants/app_colors.dart';
import '../../core/formatting/inr_format.dart';
import '../../core/whatsapp/whatsapp_order_service.dart';
import '../../models/product.dart';
import '../../widgets/quantity_selector.dart';

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key, required this.product});
  final Product product;
  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen>
    with SingleTickerProviderStateMixin {
  var _quantity = 1;
  final _noteController = TextEditingController();

  late final PageController _pageController;
  final _currentPage = ValueNotifier<int>(0);
  Timer? _autoScrollTimer;

  bool _isDownloading = false;
  bool _isSharing = false;

  Product get product => widget.product;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startAutoScroll();
  }

  void _startAutoScroll() {
    _autoScrollTimer?.cancel();
    final images = product.allImages;
    if (images.length <= 1) return;
    _autoScrollTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted) return;
      final next = (_currentPage.value + 1) % images.length;
      _pageController.animateToPage(
        next,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    _noteController.dispose();
    _currentPage.dispose();
    super.dispose();
  }

  Future<void> _shareProduct() async {
    final images = product.allImages;
    if (images.isEmpty) return;
    setState(() => _isSharing = true);
    final caption = [
      '🧵 *${product.name}*',
      if (product.subtitle.isNotEmpty) product.subtitle,
      '💰 ${formatInr(product.price)}',
      if (product.originalPrice != null)
        '(was ${formatInr(product.originalPrice!)})',
      '',
      '📦 Product ID: ${product.id}',
      '',
      'Order via Swastik Fashion 🛍️',
    ].join('\n');
    try {
      final dio = Dio();
      final tmpDir = await getTemporaryDirectory();
      final filePath =
          '${tmpDir.path}/share_${product.id}_${DateTime.now().millisecondsSinceEpoch}.jpg';
      await dio.download(images[_currentPage.value], filePath);
      if (!mounted) return;
      await Share.shareXFiles(
        [XFile(filePath, mimeType: 'image/jpeg')],
        text: caption,
        subject: product.name,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Could not share photo: $e'),
          behavior: SnackBarBehavior.floating,
        ));
      }
    } finally {
      if (mounted) setState(() => _isSharing = false);
    }
  }

  Future<void> _downloadCurrentImage() async {
    final images = product.allImages;
    if (images.isEmpty) return;
    final hasAccess = await Gal.hasAccess(toAlbum: false);
    if (!hasAccess) {
      final granted = await Gal.requestAccess(toAlbum: false);
      if (!granted) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Gallery permission denied. Cannot save photo.'),
          ));
        }
        return;
      }
    }
    setState(() => _isDownloading = true);
    try {
      final dio = Dio();
      final tmpDir = await getTemporaryDirectory();
      final filePath =
          '${tmpDir.path}/${product.id}_${DateTime.now().millisecondsSinceEpoch}.jpg';
      await dio.download(images[_currentPage.value], filePath);
      await Gal.putImage(filePath);
      try {
        await File(filePath).delete();
      } catch (_) {}
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Row(children: [
          Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
          SizedBox(width: 10),
          Expanded(
              child: Text('Photo saved to Gallery ✓',
                  style: TextStyle(fontWeight: FontWeight.w600))),
        ]),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ));
    } on GalException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Could not save: ${e.type.message}')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Download failed: $e')));
      }
    } finally {
      if (mounted) setState(() => _isDownloading = false);
    }
  }

  Future<void> _placeOrderOnWhatsApp() async {
    final ok = await WhatsappOrderService.openSingleOrder(
        buyerName: 'Buyer', product: product, quantity: _quantity);
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Opening WhatsApp with your order…')));
    } else {
      final text = WhatsappOrderService.buildSingleMessage(
          buyerName: 'Buyer', product: product, quantity: _quantity);
      await Clipboard.setData(ClipboardData(text: text));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text(
              'Could not open WhatsApp. Order text copied to clipboard.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.cart;
    final images = product.allImages;
    final mq = MediaQuery.sizeOf(context);
    final imgH = (mq.width * 1.05).clamp(320.0, 520.0);

    return Scaffold(
      backgroundColor: AppColors.cream,
      body: Stack(
        children: [
          // ── Full-bleed image hero ─────────────────────────────────────────
          SizedBox(
            height: imgH,
            width: double.infinity,
            child: _buildImageSlider(images, imgH),
          ),

          // ── Scrollable info sheet ─────────────────────────────────────────
          SingleChildScrollView(
            child: Column(
              children: [
                // Transparent space for hero
                SizedBox(height: imgH - 40),

                // ── Info panel ──────────────────────────────────────────────
                Container(
                  decoration: const BoxDecoration(
                    color: AppColors.cream,
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(36)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 28, 24, 40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Drag handle
                        Center(
                          child: Container(
                            width: 44,
                            height: 4,
                            margin: const EdgeInsets.only(bottom: 22),
                            decoration: BoxDecoration(
                              color: AppColors.divider,
                              borderRadius: BorderRadius.circular(99),
                            ),
                          ),
                        ),

                        // Product ID + badge
                        Row(
                          children: [
                            Text(
                              product.id,
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: AppColors.textHint,
                                letterSpacing: 0.5,
                              ),
                            ),
                            if (product.badge != null) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  gradient: AppColors.goldGradient,
                                  borderRadius: BorderRadius.circular(99),
                                ),
                                child: Text(
                                  product.badge!.toUpperCase(),
                                  style: GoogleFonts.poppins(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.white,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Name
                        Text(
                          product.name,
                          style: GoogleFonts.playfairDisplay(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Subtitle
                        if (product.subtitle.isNotEmpty)
                          Text(
                            product.subtitle,
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        const SizedBox(height: 18),

                        // Price row
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              formatInr(product.price),
                              style: GoogleFonts.playfairDisplay(
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                                color: AppColors.maroon,
                              ),
                            ),
                            if (product.originalPrice != null) ...[
                              const SizedBox(width: 12),
                              Padding(
                                padding: const EdgeInsets.only(bottom: 2),
                                child: Text(
                                  formatInr(product.originalPrice!),
                                  style: GoogleFonts.poppins(
                                    fontSize: 15,
                                    color: AppColors.textHint,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Padding(
                                padding: const EdgeInsets.only(bottom: 2),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.peach,
                                    borderRadius: BorderRadius.circular(99),
                                    border: Border.all(
                                        color: AppColors.maroon
                                            .withValues(alpha: 0.3)),
                                  ),
                                  child: Text(
                                    '${(((product.originalPrice! - product.price) / product.originalPrice!) * 100).round()}% off',
                                    style: GoogleFonts.poppins(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.maroon,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Estimated for $_quantity pc: ${formatInr(product.price * _quantity)}',
                          style: GoogleFonts.poppins(
                              fontSize: 13, color: AppColors.textSecondary),
                        ),

                        const SizedBox(height: 24),

                        // ── Quantity ──────────────────────────────────────────
                        Text('Quantity',
                            style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w700, fontSize: 15)),
                        const SizedBox(height: 10),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: QuantitySelector(
                            quantity: _quantity,
                            onDecrement: () => setState(
                                () { if (_quantity > 1) _quantity--; }),
                            onIncrement: () => setState(
                                () { if (_quantity < 999) _quantity++; }),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // ── Note ─────────────────────────────────────────────
                        Text('Note to shop (optional)',
                            style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w700, fontSize: 15)),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _noteController,
                          maxLines: 3,
                          style: GoogleFonts.poppins(fontSize: 14),
                          decoration: InputDecoration(
                            hintText:
                                'e.g. Need before Diwali, specific shade…',
                            filled: true,
                            fillColor: AppColors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide:
                                  const BorderSide(color: AppColors.divider),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide:
                                  const BorderSide(color: AppColors.divider),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide: const BorderSide(
                                  color: AppColors.gold, width: 1.5),
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),

                        // ── WhatsApp CTA ──────────────────────────────────────
                        GestureDetector(
                          onTap: _placeOrderOnWhatsApp,
                          child: Container(
                            height: 58,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF1B8C4D), Color(0xFF25D366)],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                              borderRadius: BorderRadius.circular(18),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF25D366)
                                      .withValues(alpha: 0.35),
                                  blurRadius: 18,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.chat_rounded,
                                    color: AppColors.white, size: 22),
                                const SizedBox(width: 10),
                                Text(
                                  'Place order on WhatsApp',
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 16,
                                    color: AppColors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // ── Add to cart ───────────────────────────────────────
                        OutlinedButton(
                          onPressed: () {
                            cart.add(product, quantity: _quantity);
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text(
                                    'Added $_quantity × ${product.name} to cart')));
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.maroon,
                            side: const BorderSide(
                                color: AppColors.maroon, width: 1.4),
                            padding:
                                const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18)),
                          ),
                          child: Text(
                            'Add to cart instead',
                            style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w600, fontSize: 15),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Floating back + action buttons ────────────────────────────────
          Positioned(
            top: MediaQuery.paddingOf(context).top + 8,
            left: 12,
            right: 12,
            child: Row(
              children: [
                _FloatingIconBtn(
                  icon: Icons.arrow_back_ios_new_rounded,
                  onTap: () => Navigator.of(context).pop(),
                ),
                const Spacer(),
                _FloatingIconBtn(
                  icon: _isSharing
                      ? Icons.hourglass_bottom_rounded
                      : Icons.share_rounded,
                  onTap: _isSharing ? null : _shareProduct,
                ),
                const SizedBox(width: 8),
                _FloatingIconBtn(
                  icon: _isDownloading
                      ? Icons.hourglass_bottom_rounded
                      : Icons.download_rounded,
                  onTap: _isDownloading ? null : _downloadCurrentImage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageSlider(List<String> images, double h) {
    if (images.isEmpty) {
      return Container(
        height: h,
        decoration: const BoxDecoration(gradient: AppColors.maroonGradient),
        alignment: Alignment.center,
        child: const Icon(Icons.image_outlined,
            size: 64, color: AppColors.white),
      );
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        PageView.builder(
          controller: _pageController,
          itemCount: images.length,
          onPageChanged: (i) => _currentPage.value = i,
          itemBuilder: (_, i) => CachedNetworkImage(
            imageUrl: images[i],
            fit: BoxFit.cover,
            width: double.infinity,
            memCacheWidth: 900,
            placeholder: (_, __) => Container(
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
            ),
            errorWidget: (_, __, ___) => Container(
              decoration: const BoxDecoration(gradient: AppColors.maroonGradient),
              alignment: Alignment.center,
              child: const Icon(Icons.broken_image_outlined,
                  size: 48, color: AppColors.white),
            ),
          ),
        ),

        // Bottom gradient fade into the info panel
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  AppColors.cream.withValues(alpha: 0.3),
                  AppColors.cream,
                ],
                stops: const [0.5, 0.85, 1.0],
              ),
            ),
          ),
        ),

        // Dot indicators
        if (images.length > 1)
          Positioned(
            bottom: 52,
            left: 0,
            right: 0,
            child: ValueListenableBuilder<int>(
              valueListenable: _currentPage,
              builder: (_, page, __) => Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(images.length, (i) {
                  final active = i == page;
                  return GestureDetector(
                    onTap: () => _pageController.animateToPage(i,
                        duration: const Duration(milliseconds: 350),
                        curve: Curves.easeInOut),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      height: 7,
                      width: active ? 26 : 7,
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
            ),
          ),
      ],
    );
  }
}

// ── Floating icon button ──────────────────────────────────────────────────────
class _FloatingIconBtn extends StatelessWidget {
  const _FloatingIconBtn({required this.icon, this.onTap});
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.45),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
        ),
        child: Icon(icon, color: AppColors.white, size: 20),
      ),
    );
  }
}

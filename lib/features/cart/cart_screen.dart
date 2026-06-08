import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../cart/cart_context.dart';
import '../../core/constants/app_colors.dart';
import '../../core/whatsapp/whatsapp_order_service.dart';
import '../../data/sample_data.dart';
import '../../features/auth/models/app_user.dart';
import '../../features/orders/order_repository.dart';
import '../../models/product.dart';
import '../../widgets/cart_item_card.dart';
import '../../widgets/order_summary_panel.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key, this.user});

  /// Logged-in buyer — used to populate the WhatsApp message.
  final AppUser? user;

  @override
  Widget build(BuildContext context) {
    final cart = context.cart;
    final pad = MediaQuery.sizeOf(context).width >= 600 ? 28.0 : 20.0;
    final top = MediaQuery.paddingOf(context).top;
    final isRoute = Navigator.canPop(context);

    List<Widget> headerSlivers() => [
          SliverToBoxAdapter(child: SizedBox(height: isRoute ? 8 : top + 12)),
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: pad),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your Cart',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  ListenableBuilder(
                    listenable: cart,
                    builder: (context, _) => Text(
                      '${cart.totalQuantity} items selected',
                      style: GoogleFonts.poppins(
                          color: AppColors.textSecondary, fontSize: 14),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ];

    Widget buildContent() {
      return ListenableBuilder(
        listenable: cart,
        builder: (context, _) {
          final lines = cart.lines;

          if (lines.isEmpty) {
            return CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                ...headerSlivers(),
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.shopping_bag_outlined,
                            size: 64,
                            color: AppColors.textSecondary.withValues(alpha: 0.4)),
                        const SizedBox(height: 16),
                        Text(
                          'Your cart is empty',
                          style: GoogleFonts.playfairDisplay(
                              fontSize: 20, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Browse the collection and add sarees.',
                          style: GoogleFonts.poppins(
                              color: AppColors.textSecondary, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }

          final summary = SampleData.orderSummary(lines);

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              ...headerSlivers(),
              SliverPadding(
                padding: EdgeInsets.symmetric(horizontal: pad),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) {
                      final line = lines[i];
                      return CartItemCard(
                        product: line.product,
                        quantity: line.quantity,
                        onIncrement: () => cart.add(line.product, quantity: 1),
                        onDecrement: () =>
                            cart.setQuantity(line.product.id, line.quantity - 1),
                        onDelete: () => cart.remove(line.product.id),
                      );
                    },
                    childCount: lines.length,
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(pad, 8, pad, 16),
                  child: OrderSummaryPanel(summary: summary),
                ),
              ),
              // ── WhatsApp Order Button ──────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(pad, 0, pad, 32),
                  child: _WhatsAppOrderButton(
                    lines: lines,
                    user: user,
                    onSuccess: () => cart.clear(),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 60)),
            ],
          );
        },
      );
    }

    if (isRoute) {
      return Scaffold(
        backgroundColor: AppColors.cream,
        appBar: AppBar(
          backgroundColor: AppColors.cream,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            'Cart',
            style: GoogleFonts.playfairDisplay(
                fontWeight: FontWeight.w700, fontSize: 22),
          ),
        ),
        body: buildContent(),
      );
    }

    return buildContent();
  }
}

// ── WhatsApp Order Button widget ─────────────────────────────────────────────

class _WhatsAppOrderButton extends StatefulWidget {
  const _WhatsAppOrderButton({
    required this.lines,
    required this.user,
    required this.onSuccess,
  });

  final List<CartLine> lines;
  final AppUser? user;
  final VoidCallback onSuccess;

  @override
  State<_WhatsAppOrderButton> createState() => _WhatsAppOrderButtonState();
}

class _WhatsAppOrderButtonState extends State<_WhatsAppOrderButton> {
  bool _loading = false;

  Future<void> _sendOrder() async {
    setState(() => _loading = true);
    try {
      // 1️⃣ Save order to Supabase first
      final supabaseUser = Supabase.instance.client.auth.currentUser;
      if (supabaseUser != null) {
        try {
          await OrderRepository().create(
            buyerId: supabaseUser.id,
            buyerName: widget.user?.businessName ?? 'Buyer',
            buyerPhone: widget.user?.phone,
            lines: widget.lines,
            total: widget.lines.fold(0, (s, l) => s + l.lineTotal),
          );
        } catch (_) {
          // Order save failed silently — WhatsApp still opens
        }
      }

      // 2️⃣ Open WhatsApp
      final success = await WhatsappOrderService.openCartOrder(
        lines: widget.lines,
        buyerName: widget.user?.businessName ?? 'Buyer',
        buyerPhone: widget.user?.phone,
      );

      if (!mounted) return;

      if (success) {
        widget.onSuccess(); // clear cart
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF25D366),
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 10),
                Text(
                  'WhatsApp opened! Send the message to place your order.',
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                ),
              ],
            ),
          ),
        );
        if (Navigator.canPop(context)) Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open WhatsApp. Is it installed?',
                style: GoogleFonts.poppins()),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        onPressed: _loading ? null : _sendOrder,
        icon: _loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.chat_rounded, color: Colors.white),
        label: Text(
          _loading ? 'Opening WhatsApp…' : 'Order on WhatsApp',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w700,
            fontSize: 16,
            color: Colors.white,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF25D366), // WhatsApp green
          foregroundColor: Colors.white,
          elevation: 4,
          shadowColor: const Color(0xFF25D366).withValues(alpha: 0.4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

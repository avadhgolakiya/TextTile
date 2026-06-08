import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/constants/app_colors.dart';
import '../core/formatting/inr_format.dart';
import '../models/order.dart';
import 'app_network_image.dart';

class OrderCard extends StatelessWidget {
  const OrderCard({super.key, required this.order, this.onView});

  final OrderItem order;
  final VoidCallback? onView;

  _OrderBadgeStyle _badge() {
    switch (order.status) {
      case OrderStatus.pending:
        return const _OrderBadgeStyle(
          background: Color(0xFFFEF3C7),
          foreground: AppColors.pending,
          icon: Icons.hourglass_top_rounded,
          label: 'Pending',
        );
      case OrderStatus.delivered:
        return const _OrderBadgeStyle(
          background: AppColors.peachSoft,
          foreground: AppColors.delivered,
          icon: Icons.check_circle_outline,
          label: 'Delivered',
        );
      case OrderStatus.inTransit:
        return const _OrderBadgeStyle(
          background: AppColors.peachSoft,
          foreground: AppColors.inTransit,
          icon: Icons.local_shipping_outlined,
          label: 'In transit',
        );
      case OrderStatus.processing:
        return const _OrderBadgeStyle(
          background: AppColors.peachSoft,
          foreground: AppColors.processing,
          icon: Icons.schedule,
          label: 'Processing',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = _badge();
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  order.dateLabel,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    letterSpacing: 0.8,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: s.background,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(s.icon, size: 16, color: s.foreground),
                    const SizedBox(width: 6),
                    Text(
                      s.label,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: s.foreground,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            order.id,
            style: GoogleFonts.playfairDisplay(
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(height: 1),
          ),
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: SizedBox(
                  width: 60,
                  height: 60,
                  child: AppNetworkImage(url: order.thumbnailUrl, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.title,
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      order.itemCountLabel,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    formatInr(order.total),
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  TextButton(
                    onPressed: onView,
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.goldMuted,
                      padding: EdgeInsets.zero,
                      minimumSize: const Size(0, 0),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      'View →',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _OrderBadgeStyle {
  const _OrderBadgeStyle({
    required this.background,
    required this.foreground,
    required this.icon,
    required this.label,
  });

  final Color background;
  final Color foreground;
  final IconData icon;
  final String label;
}

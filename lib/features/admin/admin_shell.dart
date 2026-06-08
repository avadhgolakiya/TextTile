import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/constants/app_colors.dart';
import 'orders/admin_orders_screen.dart';
import 'products/admin_products_screen.dart';
import 'buyers/admin_buyers_screen.dart';
import 'banners/admin_banners_screen.dart';

/// Top-level admin panel — tab host for Products / Orders / Buyers / Banners.
class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell>
    with SingleTickerProviderStateMixin {
  late final TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top;
    return Scaffold(
      backgroundColor: AppColors.cream,
      body: Column(
        children: [
          // ── Admin header + tab bar ──────────────────────────────────────
          Container(
            color: AppColors.maroon,
            padding: EdgeInsets.fromLTRB(20, top + 12, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.admin_panel_settings_rounded,
                          color: AppColors.white, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Admin Panel',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.white.withValues(alpha: 0.85),
                        letterSpacing: 1.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Swastik Fashion',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 16),
                TabBar(
                  controller: _tab,
                  indicatorColor: AppColors.gold,
                  indicatorWeight: 3,
                  labelColor: AppColors.white,
                  unselectedLabelColor:
                      AppColors.white.withValues(alpha: 0.55),
                  labelStyle: GoogleFonts.poppins(
                      fontWeight: FontWeight.w700, fontSize: 12),
                  unselectedLabelStyle: GoogleFonts.poppins(fontSize: 12),
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  tabs: const [
                    Tab(
                        icon: Icon(Icons.inventory_2_outlined, size: 20),
                        text: 'Products'),
                    Tab(
                        icon: Icon(Icons.receipt_long_outlined, size: 20),
                        text: 'Orders'),
                    Tab(
                        icon: Icon(Icons.people_outline, size: 20),
                        text: 'Buyers'),
                    Tab(
                        icon: Icon(Icons.image_outlined, size: 20),
                        text: 'Banners'),
                  ],
                ),
              ],
            ),
          ),

          // ── Tab body ─────────────────────────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tab,
              children: const [
                AdminProductsScreen(),
                AdminOrdersScreen(),
                AdminBuyersScreen(),
                AdminBannersScreen(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

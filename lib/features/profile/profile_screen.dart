import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../cart/cart_store.dart';
import '../../core/constants/app_colors.dart';
import '../auth/auth_controller.dart';
import '../auth/models/app_user.dart';
import '../../widgets/profile_menu_tile.dart';
import '../../widgets/section_header.dart';
import '../../widgets/stat_pill.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.auth, required this.cart});

  final AuthController auth;
  final CartStore cart;

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    final pad = w >= 600 ? 28.0 : 20.0;
    final top = MediaQuery.paddingOf(context).top;

    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: _ProfileHeader(
            topInset: top,
            horizontalPad: pad,
            user: auth.user,
          ),
        ),
        SliverToBoxAdapter(
          child: Transform.translate(
            offset: const Offset(0, -32),
            child: Container(
              decoration: const BoxDecoration(
                color: AppColors.cream,
                borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
              ),
              child: Padding(
                padding: EdgeInsets.fromLTRB(pad, 36, pad, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SectionHeader(
                      title: 'Account',
                      actionLabel: '',
                      onAction: () {},
                    ),

                    // ── Menu card ─────────────────────────────────────────
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.maroon.withValues(alpha: 0.06),
                            blurRadius: 24,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          ProfileMenuTile(
                            icon: Icons.bookmark_rounded,
                            title: 'Saved Products',
                            subtitle: '12 items',
                            onTap: () {},
                          ),
                          ProfileMenuTile(
                            icon: Icons.location_on_rounded,
                            title: 'Shipping Address',
                            subtitle: 'Surat, Gujarat',
                            onTap: () {},
                          ),
                          ProfileMenuTile(
                            icon: Icons.credit_card_rounded,
                            title: 'Payment Methods',
                            subtitle: 'UPI • Bank',
                            onTap: () {},
                          ),
                          ProfileMenuTile(
                            icon: Icons.settings_rounded,
                            title: 'Preferences',
                            subtitle: 'Notifications, language',
                            onTap: () {},
                          ),
                          ProfileMenuTile(
                            icon: Icons.help_rounded,
                            title: 'Help & Support',
                            subtitle: 'WhatsApp, FAQ',
                            onTap: () {},
                            showDivider: false,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── Logout ────────────────────────────────────────────
                    GestureDetector(
                      onTap: () async {
                        cart.clear();
                        await auth.signOut();
                      },
                      child: Container(
                        width: double.infinity,
                        height: 54,
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.divider),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.logout_rounded,
                                color: AppColors.maroon, size: 20),
                            const SizedBox(width: 10),
                            Text(
                              'Logout',
                              style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                                color: AppColors.maroon,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                    Center(
                      child: Text(
                        '✦  SWASTIK FASHION · V1.0  ✦',
                        style: GoogleFonts.poppins(
                          fontSize: 10.5,
                          letterSpacing: 2,
                          color: AppColors.textHint,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 110),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.topInset,
    required this.horizontalPad,
    required this.user,
  });

  final double topInset;
  final double horizontalPad;
  final AppUser? user;

  @override
  Widget build(BuildContext context) {
    final phone = user?.phone;
    final contactLine =
        (phone != null && phone.isNotEmpty) ? phone : (user?.email ?? '');
    final contactIcon = (phone != null && phone.isNotEmpty)
        ? Icons.phone_in_talk_rounded
        : Icons.email_rounded;

    return Container(
      width: double.infinity,
      padding:
          EdgeInsets.fromLTRB(horizontalPad, topInset + 20, horizontalPad, 68),
      decoration: const BoxDecoration(gradient: AppColors.heroGradient),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'WHOLESALE BUYER',
            style: GoogleFonts.poppins(
              color: AppColors.gold,
              fontSize: 11,
              letterSpacing: 2.5,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar circle
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppColors.goldGradient,
                  border: Border.all(
                      color: AppColors.gold.withValues(alpha: 0.6), width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.gold.withValues(alpha: 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Text(
                  user?.initials ?? '?',
                  style: GoogleFonts.playfairDisplay(
                    color: AppColors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.businessName ?? 'Wholesale buyer',
                      style: GoogleFonts.playfairDisplay(
                        color: AppColors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(contactIcon,
                            color: AppColors.white.withValues(alpha: 0.7),
                            size: 15),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            contactLine,
                            style: GoogleFonts.poppins(
                              color: AppColors.white.withValues(alpha: 0.75),
                              fontSize: 13,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Edit button
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: AppColors.white.withValues(alpha: 0.2)),
                ),
                child: Text(
                  'EDIT',
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.white,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Row(
            children: [
              StatPill(value: '47', label: 'ORDERS'),
              SizedBox(width: 10),
              StatPill(value: '12', label: 'SAVED'),
              SizedBox(width: 10),
              StatPill(value: '₹2.4L', label: 'SPENT'),
            ],
          ),
        ],
      ),
    );
  }
}

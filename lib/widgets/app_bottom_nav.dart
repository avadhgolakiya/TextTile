import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/constants/app_colors.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({
    super.key,
    required this.currentIndex,
    required this.onChanged,
    this.showAdmin = false,
  });

  final int currentIndex;
  final ValueChanged<int> onChanged;
  final bool showAdmin;

  @override
  Widget build(BuildContext context) {
    // viewPadding gives the raw system inset regardless of Scaffold adjustments.
    // This is the correct way to handle bottom padding inside bottomNavigationBar.
    final bottomPad = MediaQuery.viewPaddingOf(context).bottom;

    final items = [
      const _NavItem(icon: Icons.local_fire_department_rounded, label: "Drop"),
      const _NavItem(icon: Icons.grid_view_rounded, label: 'Collection'),
      const _NavItem(icon: Icons.receipt_long_rounded, label: 'Orders'),
      const _NavItem(icon: Icons.person_rounded, label: 'Profile'),
      if (showAdmin)
        const _NavItem(icon: Icons.admin_panel_settings_rounded, label: 'Admin'),
    ];

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.white.withValues(alpha: 0.96),
            border: Border(
              top: BorderSide(color: AppColors.divider.withValues(alpha: 0.7)),
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.maroon.withValues(alpha: 0.08),
                blurRadius: 24,
                offset: const Offset(0, -6),
              ),
            ],
          ),
          // Explicit padding: top + bottom (system inset)
          padding: EdgeInsets.fromLTRB(8, 8, 8, 8 + bottomPad),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (i) {
              return _NavEntry(
                item: items[i],
                selected: i == currentIndex,
                isAdmin: showAdmin && i == items.length - 1,
                onTap: () => onChanged(i),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({required this.icon, required this.label});
  final IconData icon;
  final String label;
}

class _NavEntry extends StatelessWidget {
  const _NavEntry({
    required this.item,
    required this.selected,
    required this.onTap,
    this.isAdmin = false,
  });

  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;
  final bool isAdmin;

  @override
  Widget build(BuildContext context) {
    const activeColor = AppColors.maroon;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected
              ? activeColor.withValues(alpha: 0.10)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              item.icon,
              size: 22,
              color: selected ? activeColor : AppColors.textSecondary,
            ),
            const SizedBox(height: 3),
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.poppins(
                fontSize: 9,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? activeColor : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

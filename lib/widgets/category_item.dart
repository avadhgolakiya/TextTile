import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/constants/app_colors.dart';

// Category gradient presets — cycles through brand-complementary palettes
const _kGradients = [
  [Color(0xFF7B1428), Color(0xFF9C2035)],
  [Color(0xFFBF9B45), Color(0xFFD4AE55)],
  [Color(0xFF6B3FA0), Color(0xFF8B5CC8)],
  [Color(0xFF1A6B45), Color(0xFF2A9060)],
  [Color(0xFF7B1428), Color(0xFF9C2035)],
  [Color(0xFF1A4A7B), Color(0xFF2A6AAB)],
];

class CategoryItem extends StatefulWidget {
  const CategoryItem({
    super.key,
    required this.icon,
    required this.label,
    this.onTap,
    this.colorIndex = 0,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final int colorIndex;

  @override
  State<CategoryItem> createState() => _CategoryItemState();
}

class _CategoryItemState extends State<CategoryItem>
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
    _scale = Tween<double>(begin: 1.0, end: 0.88).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final idx = widget.colorIndex % _kGradients.length;
    final colors = _kGradients[idx];

    return GestureDetector(
      onTap: () {
        _ctrl.forward().then((_) => _ctrl.reverse());
        widget.onTap?.call();
      },
      child: ScaleTransition(
        scale: _scale,
        child: SizedBox(
          width: 80,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: colors,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: colors[0].withValues(alpha: 0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Icon(widget.icon, color: AppColors.white, size: 28),
              ),
              const SizedBox(height: 9),
              Text(
                widget.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

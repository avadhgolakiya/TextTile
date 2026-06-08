import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/constants/app_colors.dart';

abstract final class AppTheme {
  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.maroon,
        brightness: Brightness.light,
        primary: AppColors.maroon,
        onPrimary: AppColors.white,
        surface: AppColors.cream,
        onSurface: AppColors.textPrimary,
        secondary: AppColors.gold,
        onSecondary: AppColors.textPrimary,
        tertiary: AppColors.peach,
        outline: AppColors.divider,
      ),
      scaffoldBackgroundColor: AppColors.cream,
      dividerColor: AppColors.divider,
      splashFactory: InkRipple.splashFactory,
      highlightColor: AppColors.maroon.withValues(alpha: 0.06),
    );

    final sans  = GoogleFonts.poppinsTextTheme(base.textTheme);
    final serif = GoogleFonts.playfairDisplayTextTheme(base.textTheme);

    return base.copyWith(
      textTheme: sans.copyWith(
        displayLarge:   serif.displayLarge?.copyWith(color: AppColors.textPrimary),
        displayMedium:  serif.displayMedium?.copyWith(color: AppColors.textPrimary),
        displaySmall:   serif.displaySmall?.copyWith(color: AppColors.textPrimary),
        headlineLarge:  serif.headlineLarge?.copyWith(color: AppColors.textPrimary),
        headlineMedium: serif.headlineMedium?.copyWith(color: AppColors.textPrimary),
        headlineSmall:  serif.headlineSmall?.copyWith(color: AppColors.textPrimary),
        titleLarge: serif.titleLarge?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w600,
        ),
        titleMedium: sans.titleMedium?.copyWith(color: AppColors.textPrimary),
        titleSmall:  sans.titleSmall?.copyWith(color: AppColors.textSecondary),
        bodyLarge:   sans.bodyLarge?.copyWith(color: AppColors.textPrimary),
        bodyMedium:  sans.bodyMedium?.copyWith(color: AppColors.textSecondary),
        bodySmall:   sans.bodySmall?.copyWith(color: AppColors.textSecondary),
        labelLarge: sans.labelLarge?.copyWith(
          color: AppColors.textPrimary,
          fontWeight: FontWeight.w600,
        ),
        labelMedium: sans.labelMedium?.copyWith(color: AppColors.textSecondary),
        labelSmall:  sans.labelSmall?.copyWith(
          color: AppColors.textSecondary,
          letterSpacing: 1.2,
        ),
      ),

      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: GoogleFonts.playfairDisplay(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),

      cardTheme: CardThemeData(
        elevation: 0,
        color: AppColors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        margin: EdgeInsets.zero,
        shadowColor: AppColors.maroon.withValues(alpha: 0.08),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        hintStyle: GoogleFonts.poppins(color: AppColors.textHint, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.gold, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFB00020)),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFB00020), width: 1.6),
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.maroon,
          foregroundColor: AppColors.white,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 17),
          shape: const StadiumBorder(),
          textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.maroon,
          foregroundColor: AppColors.white,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 17),
          shape: const StadiumBorder(),
          textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.maroon,
          side: const BorderSide(color: AppColors.maroon, width: 1.4),
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.textPrimary,
        contentTextStyle: GoogleFonts.poppins(color: AppColors.white, fontSize: 13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),

      chipTheme: ChipThemeData(
        backgroundColor: AppColors.creamDeep,
        selectedColor: AppColors.maroon,
        labelStyle: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500),
        side: const BorderSide(color: AppColors.divider),
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      ),
    );
  }
}

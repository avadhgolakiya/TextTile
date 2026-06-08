import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Pre-built [TextStyle] objects from GoogleFonts.
///
/// Using these constants instead of calling [GoogleFonts.poppins()] directly
/// in every [build()] method prevents expensive font-lookup object creation on
/// every repaint. Always prefer these static references in widget code.
abstract final class AppTextStyles {
  // ── Poppins ──────────────────────────────────────────────────────────────

  static final TextStyle poppinsXS = GoogleFonts.poppins(fontSize: 11);
  static final TextStyle poppinsXSSecondary =
      GoogleFonts.poppins(fontSize: 11, color: const Color(0xFF9E9E9E));
  static final TextStyle poppinsSM = GoogleFonts.poppins(fontSize: 12);
  static final TextStyle poppinsSMSecondary =
      GoogleFonts.poppins(fontSize: 12, color: const Color(0xFF9E9E9E));
  static final TextStyle poppinsBody = GoogleFonts.poppins(fontSize: 14);
  static final TextStyle poppinsBodySecondary =
      GoogleFonts.poppins(fontSize: 14, color: const Color(0xFF9E9E9E));
  static final TextStyle poppinsMD = GoogleFonts.poppins(fontSize: 15);
  static final TextStyle poppinsMDSecondary =
      GoogleFonts.poppins(fontSize: 15, color: const Color(0xFF9E9E9E));
  static final TextStyle poppinsLG = GoogleFonts.poppins(fontSize: 16);
  static final TextStyle poppinsXL = GoogleFonts.poppins(fontSize: 22);

  static final TextStyle poppinsSemiBold =
      GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600);
  static final TextStyle poppinsBold =
      GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700);
  static final TextStyle poppinsBoldLG =
      GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w700);
  static final TextStyle poppinsBoldXL =
      GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700);

  static final TextStyle label = GoogleFonts.poppins(
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: FontWeight.w600,
  );

  // ── Playfair Display ──────────────────────────────────────────────────────

  static final TextStyle playfairMD =
      GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.w700);
  static final TextStyle playfairLG =
      GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.w700);
  static final TextStyle playfairXL =
      GoogleFonts.playfairDisplay(fontSize: 30, fontWeight: FontWeight.w700);
  static final TextStyle playfairCard =
      GoogleFonts.playfairDisplay(fontSize: 16, fontWeight: FontWeight.w600, height: 1.15);
  static final TextStyle playfairAppBar =
      GoogleFonts.playfairDisplay(fontSize: 22, fontWeight: FontWeight.w700);
}

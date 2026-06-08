import 'package:flutter/material.dart';

/// Brand palette — Swastik Fashion premium redesign.
abstract final class AppColors {
  // ── Base ────────────────────────────────────────────────────────────────
  static const Color cream        = Color(0xFFFFF8F2);
  static const Color creamAlt     = Color(0xFFFDF5EC);
  static const Color creamDeep    = Color(0xFFF5EDE0);

  // ── Maroon family ───────────────────────────────────────────────────────
  static const Color maroon       = Color(0xFF7B1428);
  static const Color maroonDark   = Color(0xFF4E0A15);
  static const Color maroonDeep   = Color(0xFF3A0810);
  static const Color maroonLight  = Color(0xFF9C2035);
  static const Color maroonGlow   = Color(0x337B1428);

  // ── Gold family ─────────────────────────────────────────────────────────
  static const Color gold         = Color(0xFFBF9B45);
  static const Color goldBright   = Color(0xFFD4AE55);
  static const Color goldMuted    = Color(0xFF9E7F35);
  static const Color goldPale     = Color(0xFFF5E6C0);
  static const Color roseGold     = Color(0xFFD4956A);

  // ── Peach / warm neutrals ───────────────────────────────────────────────
  static const Color peach        = Color(0xFFFDE8DF);
  static const Color peachSoft    = Color(0xFFFAEBE4);
  static const Color peachDeep    = Color(0xFFF2CEBE);

  // ── Text ─────────────────────────────────────────────────────────────────
  static const Color textPrimary   = Color(0xFF1E0D07);
  static const Color textSecondary = Color(0xFF7A6860);
  static const Color textHint      = Color(0xFFA89589);

  // ── Status ───────────────────────────────────────────────────────────────
  static const Color discount   = Color(0xFFA67C52);
  static const Color delivered  = Color(0xFF2E7D32);
  static const Color inTransit  = Color(0xFF8D6E63);
  static const Color processing = Color(0xFF8B4513);
  static const Color pending    = Color(0xFFB45309);
  static const Color success    = Color(0xFF1B8A3E);

  // ── UI ───────────────────────────────────────────────────────────────────
  static const Color white   = Color(0xFFFFFFFF);
  static const Color divider = Color(0xFFEDE5DC);
  static const Color iconBg  = Color(0xFFF5E8DC);
  static const Color glass   = Color(0x18FFFFFF);
  static const Color glassBorder = Color(0x30FFFFFF);

  // ── Gradients ────────────────────────────────────────────────────────────
  static const LinearGradient maroonGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [maroonDeep, maroon, Color(0xFF6B1222)],
  );

  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [goldBright, gold, goldMuted],
  );

  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [maroonDeep, maroon, Color(0xFF8B1A2A)],
    stops: [0.0, 0.5, 1.0],
  );

  static const LinearGradient cardShadowGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Colors.transparent, Color(0xCC000000)],
    stops: [0.45, 1.0],
  );
}

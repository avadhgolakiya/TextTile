import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_colors.dart';

/// A polished "Continue with Google" button that matches the app's design
/// system. Pass [onPressed] to trigger the sign-in flow; set [loading] to
/// `true` while the async operation is in progress.
class GoogleSignInButton extends StatelessWidget {
  const GoogleSignInButton({
    super.key,
    required this.onPressed,
    this.loading = false,
  });

  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: loading ? null : onPressed,
      style: OutlinedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        side: BorderSide(color: Colors.grey.shade300, width: 1.4),
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: const StadiumBorder(),
        elevation: 0,
      ),
      child: loading
          ? const SizedBox(
              height: 22,
              width: 22,
              child: CircularProgressIndicator(
                strokeWidth: 2.2,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4285F4)),
              ),
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Google 'G' logo via SVG-style custom painter
                const _GoogleLogo(size: 20),
                const SizedBox(width: 12),
                Text(
                  'Continue with Google',
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
    );
  }
}

/// Draws the official Google 'G' coloured logo using [CustomPaint].
class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo({this.size = 24});
  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _GoogleLogoPainter(),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double s = size.width;
    final double cx = s / 2;
    final double cy = s / 2;
    final double r = s / 2;

    // Background circle (white)
    final bgPaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(cx, cy), r, bgPaint);

    // Use paths for the 'G' shape
    final clip = Path()..addOval(Rect.fromCircle(center: Offset(cx, cy), radius: r));
    canvas.clipPath(clip);

    // Blue arc (right + top portion)
    _drawArcSegment(canvas, s, const Color(0xFF4285F4), -10, 170);
    // Red arc (top-left)
    _drawArcSegment(canvas, s, const Color(0xFFEA4335), 160, 80);
    // Yellow arc (bottom-left)
    _drawArcSegment(canvas, s, const Color(0xFFFBBC05), 240, 70);
    // Green arc (bottom)
    _drawArcSegment(canvas, s, const Color(0xFF34A853), 310, 50);

    // White cutout for inner ring
    final innerCut = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(cx, cy), r * 0.62, innerCut);

    // Horizontal bar (the crossbar of the G)
    final barPaint = Paint()..color = const Color(0xFF4285F4);
    final barRect = Rect.fromLTWH(cx, cy - r * 0.135, r * 1.0, r * 0.27);
    canvas.drawRect(barRect, barPaint);
  }

  void _drawArcSegment(
      Canvas canvas, double s, Color color, double startDeg, double sweepDeg) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final rect = Rect.fromLTWH(0, 0, s, s);
    final path = Path()
      ..moveTo(s / 2, s / 2)
      ..arcTo(
        rect,
        _toRad(startDeg),
        _toRad(sweepDeg),
        false,
      )
      ..close();
    canvas.drawPath(path, paint);
  }

  double _toRad(double deg) => deg * 3.14159265358979 / 180;

  @override
  bool shouldRepaint(_GoogleLogoPainter oldDelegate) => false;
}

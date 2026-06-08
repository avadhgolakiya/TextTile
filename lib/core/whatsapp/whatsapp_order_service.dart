import 'package:url_launcher/url_launcher.dart';

import '../../models/product.dart';
import '../constants/shop_contact.dart';
import '../formatting/inr_format.dart';

/// Builds the WhatsApp order message for a full cart and opens WhatsApp.
abstract final class WhatsappOrderService {
  // ── Message builder ───────────────────────────────────────────────────────

  static String buildCartMessage({
    required List<CartLine> lines,
    required String buyerName,
    String? buyerPhone,
  }) {
    final b = StringBuffer();

    b.writeln('🧵 *New Order — ${ShopContact.businessName}*');
    b.writeln();
    b.writeln('👤 *Buyer:* $buyerName');
    if (buyerPhone != null && buyerPhone.trim().isNotEmpty) {
      b.writeln('📞 *Phone:* ${buyerPhone.trim()}');
    }
    b.writeln();
    b.writeln('*Items Ordered:*');
    b.writeln('━━━━━━━━━━━━━━━━━━━');

    int runningTotal = 0;
    for (int i = 0; i < lines.length; i++) {
      final line = lines[i];
      final lineTotal = line.product.price * line.quantity;
      runningTotal += lineTotal;

      b.writeln('${i + 1}. *${line.product.name}*');
      b.writeln('   Code: ${line.product.id}');
      if (line.product.subtitle.isNotEmpty) {
        b.writeln('   Details: ${line.product.subtitle}');
      }
      b.writeln('   Qty: ${line.quantity} × ${formatInr(line.product.price)}');
      b.writeln('   Subtotal: ${formatInr(lineTotal)}');
      // Image link
      if (line.product.imageUrl.isNotEmpty) {
        b.writeln('   📷 Photo: ${line.product.imageUrl}');
      }
      b.writeln();
    }

    b.writeln('━━━━━━━━━━━━━━━━━━━');
    b.writeln('🛒 *Total: ${formatInr(runningTotal)}*');

    // 10% wholesale discount
    final discounted = (runningTotal * 0.9).round();
    b.writeln('💰 *After 10% discount: ${formatInr(discounted)}*');
    b.writeln();
    b.writeln('Please confirm my order. I will visit your shop for pickup.');

    return b.toString();
  }

  // ── Single-product helper (kept for product detail page) ─────────────────

  static String buildSingleMessage({
    required String buyerName,
    String? buyerPhone,
    required Product product,
    required int quantity,
  }) {
    return buildCartMessage(
      lines: [CartLine(product: product, quantity: quantity)],
      buyerName: buyerName,
      buyerPhone: buyerPhone,
    );
  }

  // ── URI builder ───────────────────────────────────────────────────────────

  static Uri cartUri({
    required List<CartLine> lines,
    required String buyerName,
    String? buyerPhone,
  }) {
    final text = buildCartMessage(
      lines: lines,
      buyerName: buyerName,
      buyerPhone: buyerPhone,
    );
    return Uri.parse(
      'https://wa.me/${ShopContact.whatsappOrderDigits}?text=${Uri.encodeComponent(text)}',
    );
  }

  // ── Launcher ──────────────────────────────────────────────────────────────

  /// Returns `true` if WhatsApp was opened successfully.
  static Future<bool> openCartOrder({
    required List<CartLine> lines,
    required String buyerName,
    String? buyerPhone,
  }) async {
    final uri = cartUri(
      lines: lines,
      buyerName: buyerName,
      buyerPhone: buyerPhone,
    );
    try {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      return false;
    }
  }

  /// Single product (from product detail page order button).
  static Future<bool> openSingleOrder({
    required String buyerName,
    String? buyerPhone,
    required Product product,
    required int quantity,
  }) async {
    return openCartOrder(
      lines: [CartLine(product: product, quantity: quantity)],
      buyerName: buyerName,
      buyerPhone: buyerPhone,
    );
  }
}

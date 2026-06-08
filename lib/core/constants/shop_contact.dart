/// Shop owner contact for WhatsApp order links (`wa.me/<digits>` — no `+` or spaces).
///
/// Replace with your real business WhatsApp number before production.
abstract final class ShopContact {
  /// E.164 digits only, e.g. India `919876543210` for +91 98765 43210.
  static const String whatsappOrderDigits = '919408354563';

  static const String businessName = 'Swastik Fashion';
}

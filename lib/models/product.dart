class Product {
  const Product({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.price,
    required this.originalPrice,
    required this.imageUrl,
    this.imageUrls = const [],
    this.badge,
    this.categoryKey,
    this.isVisible = true,
  });

  final String id;
  final String name;
  final String subtitle;
  final int price;
  final int? originalPrice;
  final String imageUrl;
  final List<String> imageUrls;
  final String? badge;

  /// Lowercase slug aligned with [CategoryItemData.label], e.g. `banarasi`.
  final String? categoryKey;

  /// Whether this product is visible to buyers. Admin can toggle this flag.
  /// Defaults to [true] — all new and existing products are visible by default.
  final bool isVisible;

  /// All images to display in the product detail slider.
  /// Falls back to [imageUrl] if [imageUrls] is empty.
  List<String> get allImages {
    if (imageUrls.isNotEmpty) return imageUrls;
    if (imageUrl.isNotEmpty) return [imageUrl];
    return [];
  }
}

class CartLine {
  const CartLine({required this.product, required this.quantity});

  final Product product;
  final int quantity;

  int get lineTotal => product.price * quantity;
}

class OrderSummary {
  const OrderSummary({
    required this.subtotal,
    required this.discountPercent,
    required this.shippingLabel,
    required this.shippingAmount,
  });

  final int subtotal;
  final int discountPercent;
  final String shippingLabel;
  final int shippingAmount;

  int get discountAmount => (subtotal * discountPercent / 100).round();

  int get total => subtotal - discountAmount + shippingAmount;
}

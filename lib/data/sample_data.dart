import 'package:flutter/material.dart';

import '../models/category.dart';
import '../models/product.dart';

/// App-level UI constants — categories, banner image, and utility functions.
/// Sample product/order lists have been removed; all data now comes from Supabase.
abstract final class SampleData {
  /// Promo banner image URL shown on the home screen.
  static const String bannerFabric =
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80';

  /// Saree category chips shown on the home screen.
  static const List<CategoryItemData> categories = [
    CategoryItemData(label: 'Banarasi', icon: Icons.auto_awesome),
    CategoryItemData(label: 'Kanjivaram', icon: Icons.diamond_outlined),
    CategoryItemData(label: 'Chiffon', icon: Icons.blur_on),
    CategoryItemData(label: 'Georgette', icon: Icons.grid_on_outlined),
    CategoryItemData(label: 'Cotton', icon: Icons.local_florist_outlined),
  ];

  /// Utility: compute order summary totals from cart lines.
  static OrderSummary orderSummary(List<CartLine> lines) {
    final subtotal = lines.fold<int>(0, (s, l) => s + l.lineTotal);
    return OrderSummary(
      subtotal: subtotal,
      discountPercent: 10,
      shippingLabel: 'Free',
      shippingAmount: 0,
    );
  }
}

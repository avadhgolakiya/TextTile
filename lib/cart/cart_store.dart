import 'package:flutter/foundation.dart';

import '../models/product.dart';

/// In-memory cart; swap for persisted cart + API sync in production.
class CartStore extends ChangeNotifier {
  final Map<String, CartLine> _byId = {};

  List<CartLine> get lines {
    final entries = _byId.entries.toList()..sort((a, b) => a.key.compareTo(b.key));
    return entries.map((e) => e.value).toList();
  }

  int get totalQuantity => lines.fold<int>(0, (s, l) => s + l.quantity);

  void add(Product product, {int quantity = 1}) {
    if (quantity <= 0) return;
    final existing = _byId[product.id];
    final next = (existing?.quantity ?? 0) + quantity;
    _byId[product.id] = CartLine(product: product, quantity: next);
    notifyListeners();
  }

  void setQuantity(String productId, int quantity) {
    final line = _byId[productId];
    if (line == null) return;
    if (quantity <= 0) {
      _byId.remove(productId);
    } else {
      _byId[productId] = CartLine(product: line.product, quantity: quantity);
    }
    notifyListeners();
  }

  void remove(String productId) {
    _byId.remove(productId);
    notifyListeners();
  }

  void clear() {
    _byId.clear();
    notifyListeners();
  }
}

import 'package:flutter/material.dart';

import 'cart_store.dart';

/// Provides [CartStore] to the whole app (including pushed routes) and
/// rebuilds when the cart changes.
class CartAnchor extends StatefulWidget {
  const CartAnchor({super.key, required this.cart, required this.child});

  final CartStore cart;
  final Widget child;

  @override
  State<CartAnchor> createState() => _CartAnchorState();
}

class _CartAnchorState extends State<CartAnchor> {
  @override
  void initState() {
    super.initState();
    widget.cart.addListener(_onCart);
  }

  @override
  void didUpdateWidget(CartAnchor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.cart != widget.cart) {
      oldWidget.cart.removeListener(_onCart);
      widget.cart.addListener(_onCart);
    }
  }

  @override
  void dispose() {
    widget.cart.removeListener(_onCart);
    super.dispose();
  }

  void _onCart() => setState(() {});

  @override
  Widget build(BuildContext context) {
    return CartInherited(cart: widget.cart, child: widget.child);
  }
}

class CartInherited extends InheritedWidget {
  const CartInherited({super.key, required this.cart, required super.child});

  final CartStore cart;

  static CartStore of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CartInherited>();
    assert(scope != null, 'CartInherited not found above this context');
    return scope!.cart;
  }

  @override
  bool updateShouldNotify(CartInherited oldWidget) => true;
}

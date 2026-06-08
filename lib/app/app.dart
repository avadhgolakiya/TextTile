import 'package:flutter/material.dart';

import '../cart/cart_anchor.dart';
import '../cart/cart_store.dart';
import '../features/auth/auth_controller.dart';
import '../theme/app_theme.dart';
import 'app_root.dart';

class SaarikaApp extends StatelessWidget {
  const SaarikaApp({super.key, required this.auth, required this.cart});

  final AuthController auth;
  final CartStore cart;

  @override
  Widget build(BuildContext context) {
    return CartAnchor(
      cart: cart,
      child: MaterialApp(
        title: 'Swastik Fashion',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        home: AppRoot(auth: auth, cart: cart),
      ),
    );
  }
}

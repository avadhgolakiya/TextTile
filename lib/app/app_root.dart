import 'dart:async';

import 'package:flutter/material.dart';

import '../cart/cart_store.dart';
import '../features/auth/auth_controller.dart';
import '../features/auth/login_screen.dart';
import '../features/splash/splash_screen.dart';
import 'main_shell.dart';

/// Shows [SplashScreen] first, then login or main app based on [AuthController].
class AppRoot extends StatefulWidget {
  const AppRoot({super.key, required this.auth, required this.cart});

  final AuthController auth;
  final CartStore cart;

  @override
  State<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<AppRoot> {
  var _showSplash = true;
  Timer? _splashTimer;

  static const _splashDuration = Duration(milliseconds: 2400);

  @override
  void initState() {
    super.initState();
    _splashTimer = Timer(_splashDuration, () {
      if (mounted) setState(() => _showSplash = false);
    });
  }

  @override
  void dispose() {
    _splashTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return const SplashScreen();
    }
    return ListenableBuilder(
      listenable: widget.auth,
      builder: (context, _) {
        return widget.auth.isAuthenticated
            ? MainShell(auth: widget.auth, cart: widget.cart)
            : LoginScreen(auth: widget.auth);
      },
    );
  }
}

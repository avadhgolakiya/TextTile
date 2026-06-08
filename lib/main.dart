import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/app.dart';
import 'cart/cart_store.dart';
import 'core/config/api_config.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/auth_repository_factory.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase — session is persisted automatically across restarts.
  await Supabase.initialize(
    url: ApiConfig.supabaseUrl,
    anonKey: ApiConfig.supabaseAnonKey,
  );

  final auth = AuthController(createAuthRepository());
  await auth.restoreSessionIfAny();   // reads cached Supabase session

  final cart = CartStore();
  runApp(SaarikaApp(auth: auth, cart: cart));
}


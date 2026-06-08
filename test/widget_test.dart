import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:saarika/app/app.dart';
import 'package:saarika/cart/cart_store.dart';
import 'package:saarika/features/auth/auth_controller.dart';
import 'package:saarika/features/auth/in_memory_auth_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  SharedPreferences.setMockInitialValues({});

  testWidgets('Material app mounts', (tester) async {
    final auth = AuthController(InMemoryAuthRepository());
    await auth.restoreSessionIfAny();
    final cart = CartStore();
    await tester.pumpWidget(SaarikaApp(auth: auth, cart: cart));
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

import 'package:flutter/foundation.dart';

import 'auth_repository.dart';
import 'models/app_user.dart';

class AuthController extends ChangeNotifier {
  AuthController(this._repository);

  final AuthRepository _repository;

  AppUser? _user;
  AppUser? get user => _user;

  bool get isAuthenticated => _user != null;

  /// Call after app start when using API mode (loads JWT + `/api/auth/me`).
  Future<void> restoreSessionIfAny() async {
    final u = await _repository.restoreSession();
    if (u != null) {
      _user = u;
      notifyListeners();
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    _user = await _repository.signIn(email: email, password: password);
    notifyListeners();
  }

  Future<void> signUp({
    required String businessName,
    required String email,
    String? phone,
    required String password,
  }) async {
    _user = await _repository.signUp(
      businessName: businessName,
      email: email,
      phone: phone,
      password: password,
    );
    notifyListeners();
  }

  Future<void> signOut() async {
    _user = null;
    notifyListeners();
    await _repository.signOut();
  }

  Future<void> signInWithGoogle() async {
    _user = await _repository.signInWithGoogle();
    notifyListeners();
  }
}

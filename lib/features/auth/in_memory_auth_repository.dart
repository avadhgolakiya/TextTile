import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';

import 'models/app_user.dart';
import 'auth_exception.dart' show AppAuthException;
import 'auth_repository.dart';

class InMemoryAuthRepository implements AuthRepository {
  final Map<String, _StoredAccount> _accounts = {};
  final Random _random = Random.secure();

  String _normalizeEmail(String email) => email.trim().toLowerCase();

  @override
  Future<AppUser?> restoreSession() async => null;

  @override
  Future<void> signOut() async {}

  @override
  Future<AppUser> signInWithGoogle() async {
    throw AppAuthException('Google Sign-In is only available in production mode.');
  }

  String _hash(String password, String salt) {
    final bytes = utf8.encode('$salt::$password');
    return sha256.convert(bytes).toString();
  }

  String _newSalt() => List.generate(16, (_) => _random.nextInt(256)).join();

  @override
  Future<AppUser> signIn({required String email, required String password}) async {
    await Future<void>.delayed(const Duration(milliseconds: 350));
    final key = _normalizeEmail(email);
    final acc = _accounts[key];
    if (acc == null) {
      throw AppAuthException('No account found for that email.');
    }
    final hash = _hash(password, acc.salt);
    if (hash != acc.passwordHash) {
      throw AppAuthException('Incorrect password.');
    }
    return acc.user;
  }

  @override
  Future<AppUser> signUp({
    required String businessName,
    required String email,
    String? phone,
    required String password,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    final key = _normalizeEmail(email);
    if (_accounts.containsKey(key)) {
      throw AppAuthException('An account already exists for this email.');
    }
    final salt = _newSalt();
    final user = AppUser(
      id: 'usr-${_random.nextInt(1 << 30)}',
      email: key,
      businessName: businessName.trim(),
      phone: phone?.trim().isEmpty ?? true ? null : phone!.trim(),
    );
    _accounts[key] = _StoredAccount(
      user: user,
      salt: salt,
      passwordHash: _hash(password, salt),
    );
    return user;
  }
}

class _StoredAccount {
  _StoredAccount({
    required this.user,
    required this.salt,
    required this.passwordHash,
  });

  final AppUser user;
  final String salt;
  final String passwordHash;
}

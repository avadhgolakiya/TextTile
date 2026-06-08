import 'models/app_user.dart';

abstract class AuthRepository {
  /// Restore user from persisted session (e.g. JWT), or `null` if none / invalid.
  Future<AppUser?> restoreSession();

  Future<void> signOut();

  Future<AppUser> signIn({required String email, required String password});

  Future<AppUser> signUp({
    required String businessName,
    required String email,
    String? phone,
    required String password,
  });

  /// Sign in (or up) via Google OAuth. Creates a profile row for new users
  /// using their Google display name as the initial business name.
  Future<AppUser> signInWithGoogle();
}
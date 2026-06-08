import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb
    show AuthApiException;

import '../../core/config/api_config.dart';
import 'auth_exception.dart';
import 'auth_repository.dart';
import 'models/app_user.dart';

/// Auth backed directly by Supabase — no Node/PostgreSQL backend needed.
///
/// Session persistence is handled automatically by the Supabase Flutter SDK
/// (stored in SharedPreferences). On app restart [restoreSession] reads the
/// cached session without requiring the user to sign in again.
class SupabaseAuthRepository implements AuthRepository {
  SupabaseClient get _client => Supabase.instance.client;

  // ── helpers ──────────────────────────────────────────────────────────────

  /// Build an [AppUser] from a Supabase [User] + profile row.
  Future<AppUser> _buildUser(User supabaseUser) async {
    try {
      final profile = await _client
          .from('profiles')
          .select('business_name, phone, is_admin')
          .eq('id', supabaseUser.id)
          .single();

      return AppUser(
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        businessName: (profile['business_name'] as String?) ?? '',
        phone: profile['phone'] as String?,
        isAdmin: (profile['is_admin'] as bool?) ?? false,
      );
    } catch (_) {
      // Profile row not found — return minimal user.
      return AppUser(
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        businessName: supabaseUser.email?.split('@').first ?? '',
        phone: null,
      );
    }
  }

  // ── AuthRepository ────────────────────────────────────────────────────────

  @override
  Future<AppUser?> restoreSession() async {
    final session = _client.auth.currentSession;
    if (session == null) return null;
    try {
      return await _buildUser(session.user);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<AppUser> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      final user = response.user;
      if (user == null) {
        throw AppAuthException('Sign-in failed. Please try again.');
      }
      return await _buildUser(user);
    } on AppAuthException {
      rethrow;
    } on sb.AuthApiException catch (e) {
      throw AppAuthException(_friendlyMessage(e.message));
    } catch (_) {
      throw AppAuthException(
          'Could not sign in. Check your connection and try again.');
    }
  }

  @override
  Future<AppUser> signUp({
    required String businessName,
    required String email,
    String? phone,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signUp(
        email: email.trim(),
        password: password,
      );
      final user = response.user;
      if (user == null) {
        throw AppAuthException(
          'Account created — check your email to confirm, then sign in.',
        );
      }

      // Insert profile row (business_name + phone).
      await _client.from('profiles').upsert({
        'id': user.id,
        'business_name': businessName.trim(),
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
      });

      return AppUser(
        id: user.id,
        email: user.email ?? email.trim(),
        businessName: businessName.trim(),
        phone: phone?.trim().isEmpty == true ? null : phone?.trim(),
      );
    } on AppAuthException {
      rethrow;
    } on sb.AuthApiException catch (e) {
      throw AppAuthException(_friendlyMessage(e.message));
    } catch (_) {
      throw AppAuthException('Could not create account. Try again.');
    }
  }

  @override
  Future<void> signOut() async {
    // Also sign out of Google so the chooser appears next time.
    final googleSignIn = GoogleSignIn();
    if (await googleSignIn.isSignedIn()) {
      await googleSignIn.signOut();
    }
    await _client.auth.signOut();
  }

  @override
  Future<AppUser> signInWithGoogle() async {
    try {
      final googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
        // Required for Supabase: tells Google which server will validate the token.
        // This must match the Web Client ID registered in Google Cloud Console
        // and configured in Supabase → Auth → Providers → Google.
        serverClientId: ApiConfig.googleWebClientId,
      );

      // Trigger native Google account chooser.
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled the chooser.
        throw AppAuthException('Google Sign-In was cancelled.');
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      final accessToken = googleAuth.accessToken;

      if (idToken == null) {
        throw AppAuthException('Could not get Google credentials. Try again.');
      }

      // Exchange Google tokens for a Supabase session.
      final response = await _client.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      final user = response.user;
      if (user == null) {
        throw AppAuthException('Google Sign-In failed. Please try again.');
      }

      // Upsert profile — uses Google display name as initial business name
      // for new users; existing rows are left unchanged.
      final displayName = googleUser.displayName ?? googleUser.email.split('@').first;
      await _client.from('profiles').upsert(
        {
          'id': user.id,
          'business_name': displayName,
        },
        onConflict: 'id',
        ignoreDuplicates: true, // don't overwrite existing business_name
      );

      return await _buildUser(user);
    } on AppAuthException {
      rethrow;
    } on sb.AuthApiException catch (e) {
      throw AppAuthException(_friendlyMessage(e.message));
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('cancelled') || msg.contains('sign_in_canceled')) {
        throw AppAuthException('Google Sign-In was cancelled.');
      }
      if (msg.contains('network_error') || msg.contains('SocketException')) {
        throw AppAuthException('No internet connection. Check your network and try again.');
      }
      if (msg.contains('sign_in_failed') || msg.contains('ApiException')) {
        // Common Android API errors:
        // 10  = developer error (SHA-1 / package name mismatch in Google Cloud)
        // 12500 = Google Play Services not updated
        // 12501 = user cancelled
        final code = RegExp(r'ApiException:\s*(\d+)').firstMatch(msg)?.group(1);
        if (code == '10') {
          throw AppAuthException(
            'Google Sign-In config error (code 10). '
            'Check that your Android OAuth client in Google Cloud Console '
            'has package name "com.example.saarika" and the correct SHA-1.',
          );
        }
        if (code == '12501') {
          throw AppAuthException('Google Sign-In was cancelled.');
        }
        throw AppAuthException('Google Sign-In failed (code $code). Try again.');
      }
      // Surface the raw error in debug so you can see exactly what's wrong.
      assert(() {
        // ignore: avoid_print
        print('[GoogleSignIn] Raw error: $e');
        return true;
      }());
      throw AppAuthException('Google Sign-In failed: $msg');
    }
  }

  // ── error messages ────────────────────────────────────────────────────────

  String _friendlyMessage(String raw) {
    final lower = raw.toLowerCase();
    if (lower.contains('invalid login credentials') ||
        lower.contains('invalid credentials')) {
      return 'Incorrect email or password.';
    }
    if (lower.contains('email already registered') ||
        lower.contains('already registered') ||
        lower.contains('user already registered')) {
      return 'An account with this email already exists.';
    }
    if (lower.contains('password should be at least')) {
      return 'Password must be at least 6 characters.';
    }
    if (lower.contains('unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    return raw;
  }
}

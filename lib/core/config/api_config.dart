/// Supabase project configuration.
///
/// These are safe to embed in client apps — they are public anon keys.
abstract final class ApiConfig {
  static const String supabaseUrl = 'https://nuafvriygbcbbklqcydx.supabase.co';
  static const String supabaseAnonKey =
      'sb_publishable_WF7F1CR8D2quIF4R-ErEyg_CGlmt5Vv';

  /// Google OAuth 2.0 Web Client ID (used as serverClientId for Google Sign-In).
  /// This is the Web client you registered in Google Cloud Console and added
  /// to Supabase → Authentication → Providers → Google.
  static const String googleWebClientId =
      '1067529881641-8qst8697sk74o3q7vptnf62tjke8mm82.apps.googleusercontent.com';
}

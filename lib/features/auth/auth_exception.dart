/// App-level auth error displayed to the user.
/// Renamed from AuthException to avoid collision with supabase_flutter's own AuthException.
class AppAuthException implements Exception {
  AppAuthException(this.message);
  final String message;

  @override
  String toString() => message;
}

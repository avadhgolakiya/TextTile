import 'auth_repository.dart';
import 'supabase_auth_repository.dart';

AuthRepository createAuthRepository() {
  return SupabaseAuthRepository();
}

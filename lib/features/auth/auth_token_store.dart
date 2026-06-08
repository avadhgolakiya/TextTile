import 'package:shared_preferences/shared_preferences.dart';

const _tokenKey = 'saarika_auth_token';

class AuthTokenStore {
  Future<String?> readToken() async {
    final p = await SharedPreferences.getInstance();
    return p.getString(_tokenKey);
  }

  Future<void> writeToken(String? token) async {
    final p = await SharedPreferences.getInstance();
    if (token == null || token.isEmpty) {
      await p.remove(_tokenKey);
    } else {
      await p.setString(_tokenKey, token);
    }
  }
}

class AppUser {
  const AppUser({
    required this.id,
    required this.email,
    required this.businessName,
    this.phone,
    this.isAdmin = false,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      email: json['email'] as String,
      businessName: json['businessName'] as String,
      phone: json['phone'] as String?,
      isAdmin: (json['isAdmin'] as bool?) ?? false,
    );
  }

  final String id;
  final String email;
  final String businessName;
  final String? phone;
  final bool isAdmin;

  String get initials {
    final parts = businessName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) {
      final s = parts.single;
      if (s.length >= 2) return s.substring(0, 2).toUpperCase();
      return s.isEmpty ? '?' : s[0].toUpperCase();
    }
    final a = parts[0].isNotEmpty ? parts[0][0] : '';
    final b = parts[1].isNotEmpty ? parts[1][0] : '';
    return ('$a$b').toUpperCase();
  }
}

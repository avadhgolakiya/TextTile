import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/constants/app_colors.dart';

/// Admin — list of registered buyers (placeholder until Supabase profiles query).
class AdminBuyersScreen extends StatelessWidget {
  const AdminBuyersScreen({super.key});

  // Placeholder buyers — will be replaced with Supabase profiles query.
  static const _buyers = [
    _BuyerData(name: 'Mehta Textiles', phone: '+91 98765 43210', orders: 4),
    _BuyerData(name: 'Sharma Sarees', phone: '+91 91234 56789', orders: 2),
    _BuyerData(name: 'Gupta Fabrics', phone: '+91 99887 76655', orders: 7),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
        itemCount: _buyers.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) => _BuyerTile(buyer: _buyers[i]),
      ),
    );
  }
}

class _BuyerData {
  const _BuyerData({required this.name, required this.phone, required this.orders});
  final String name;
  final String phone;
  final int orders;
}

class _BuyerTile extends StatelessWidget {
  const _BuyerTile({required this.buyer});
  final _BuyerData buyer;

  @override
  Widget build(BuildContext context) {
    final initials = buyer.name.trim().split(' ').take(2).map((w) => w.isNotEmpty ? w[0] : '').join().toUpperCase();
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        leading: CircleAvatar(
          radius: 24,
          backgroundColor: AppColors.maroon,
          child: Text(initials, style: GoogleFonts.poppins(color: AppColors.white, fontWeight: FontWeight.w700, fontSize: 15)),
        ),
        title: Text(buyer.name, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 15)),
        subtitle: Text(buyer.phone, style: GoogleFonts.poppins(color: AppColors.textSecondary, fontSize: 13)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: AppColors.gold.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            '${buyer.orders} orders',
            style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.gold),
          ),
        ),
      ),
    );
  }
}

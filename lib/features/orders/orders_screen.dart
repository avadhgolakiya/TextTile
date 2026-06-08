import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/constants/app_colors.dart';
import '../../models/order.dart';
import '../../widgets/order_card.dart';
import 'order_repository.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _repo = OrderRepository();
  late Future<List<OrderItem>> _future;

  // ValueNotifier: only the filter chip row rebuilds on tap
  final _filter = ValueNotifier<int>(0);

  static const _labels = ['All Orders', 'Pending'];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  @override
  void dispose() {
    _filter.dispose();
    super.dispose();
  }

  void _loadOrders() {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) {
      _future = Future.value([]);
      return;
    }
    setState(() {
      _future = _repo.fetchByBuyer(user.id);
    });
  }

  List<OrderItem> _filtered(List<OrderItem> orders, int filter) {
    if (filter == 1) return orders.where((o) => o.status == OrderStatus.pending).toList();
    return orders;
  }

  @override
  Widget build(BuildContext context) {
    final pad = MediaQuery.sizeOf(context).width >= 600 ? 28.0 : 20.0;
    final top = MediaQuery.paddingOf(context).top;

    return FutureBuilder<List<OrderItem>>(
      future: _future,
      builder: (context, snap) {
        final allOrders = snap.data ?? [];
        final isLoading = snap.connectionState == ConnectionState.waiting;

        return CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(child: SizedBox(height: top + 12)),

            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(pad, 0, pad + 58, 0),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('MY ACCOUNT',
                      style: GoogleFonts.poppins(
                          fontSize: 11, letterSpacing: 2,
                          color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Text('Orders',
                      style: GoogleFonts.playfairDisplay(fontSize: 30, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 18),
                ]),
              ),
            ),

            // Filter chips — only this row rebuilds on filter tap
            SliverToBoxAdapter(
              child: ValueListenableBuilder<int>(
                valueListenable: _filter,
                builder: (context, filter, _) {
                  return SizedBox(
                    height: 44,
                    child: ListView.separated(
                      padding: EdgeInsets.symmetric(horizontal: pad),
                      scrollDirection: Axis.horizontal,
                      itemCount: _labels.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, i) {
                        final selected = filter == i;
                        return ChoiceChip(
                          label: Text(_labels[i]),
                          selected: selected,
                          onSelected: (_) => _filter.value = i,
                          labelStyle: GoogleFonts.poppins(
                            fontWeight: FontWeight.w600, fontSize: 13,
                            color: selected ? AppColors.white : AppColors.textPrimary,
                          ),
                          selectedColor: AppColors.maroon,
                          backgroundColor: AppColors.peachSoft,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(999)),
                          side: BorderSide.none,
                          showCheckmark: false,
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                        );
                      },
                    ),
                  );
                },
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 16)),

            // Content — uses ValueListenableBuilder so filter changes don't
            // reload data; just re-slice the already-fetched list
            if (isLoading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              )
            else if (snap.hasError)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.textSecondary),
                    const SizedBox(height: 12),
                    Text('Could not load orders',
                        style: GoogleFonts.poppins(color: AppColors.textSecondary)),
                    TextButton(
                        onPressed: _loadOrders,
                        child: Text('Retry',
                            style: GoogleFonts.poppins(color: AppColors.maroon))),
                  ]),
                ),
              )
            else
              ValueListenableBuilder<int>(
                valueListenable: _filter,
                builder: (context, filter, _) {
                  final visible = _filtered(allOrders, filter);
                  if (visible.isEmpty) {
                    return SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Column(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.receipt_long_outlined,
                              size: 64,
                              color: AppColors.textSecondary.withValues(alpha: 0.4)),
                          const SizedBox(height: 16),
                          Text(
                            filter == 1 ? 'No pending orders' : 'No orders yet',
                            style: GoogleFonts.playfairDisplay(
                                fontSize: 20, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Add sarees to your cart and order via WhatsApp.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.poppins(
                                color: AppColors.textSecondary, height: 1.4, fontSize: 14),
                          ),
                        ]),
                      ),
                    );
                  }
                  return SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: pad),
                    sliver: SliverList.separated(
                      itemCount: visible.length,
                      separatorBuilder: (_, __) => const SizedBox.shrink(),
                      itemBuilder: (context, i) =>
                          OrderCard(order: visible[i], onView: () {}),
                    ),
                  );
                },
              ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        );
      },
    );
  }
}

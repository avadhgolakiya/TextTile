import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/constants/app_colors.dart';
import '../../../models/order.dart';
import '../../orders/order_repository.dart';

/// Admin — view ALL buyer orders and update their status.
/// Holds data in-memory; status updates are applied optimistically without
/// a full network re-fetch, so the UI responds instantly.
class AdminOrdersScreen extends StatefulWidget {
  const AdminOrdersScreen({super.key});
  @override
  State<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends State<AdminOrdersScreen> {
  final _repo = OrderRepository();
  List<OrderItem>? _orders;
  bool _loading = true;
  String? _error;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await _repo.fetchAll();
      if (mounted) setState(() { _orders = data; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  List<OrderItem> get _filtered {
    final all = _orders ?? [];
    if (_filter == 'all') return all;
    final target = {
      'pending': OrderStatus.pending,
      'processing': OrderStatus.processing,
      'delivered': OrderStatus.delivered,
    }[_filter];
    return all.where((o) => o.status == target).toList();
  }

  Future<void> _updateStatus(OrderItem order, OrderStatus status) async {
    // Optimistic in-memory update — no network re-fetch needed
    final idx = _orders?.indexWhere((o) => o.id == order.id) ?? -1;
    if (idx == -1) return;
    final updated = OrderItem(
      id: order.id,
      title: order.title,
      status: status,
      total: order.total,
      dateLabel: order.dateLabel,
      itemCountLabel: order.itemCountLabel,
      thumbnailUrl: order.thumbnailUrl,
    );
    setState(() => _orders![idx] = updated);

    try {
      await _repo.updateStatus(order.id, status);
    } catch (e) {
      // Roll back on failure
      if (mounted) {
        setState(() => _orders![idx] = order);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Update failed: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      body: Column(children: [
        // Filter chips
        SizedBox(
          height: 52,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
            scrollDirection: Axis.horizontal,
            children: ['all', 'pending', 'processing', 'delivered']
                .map((v) => _Chip(
                      label: v == 'all' ? 'All' : v[0].toUpperCase() + v.substring(1),
                      selected: _filter == v,
                      onTap: () => setState(() => _filter = v),
                    ))
                .toList(),
          ),
        ),

        // Content
        Expanded(child: _buildBody()),
      ]),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Failed to load orders',
            style: GoogleFonts.poppins(color: AppColors.textSecondary)),
        TextButton(
            onPressed: _loadOrders,
            child: Text('Retry', style: GoogleFonts.poppins(color: AppColors.maroon))),
      ]));
    }
    final visible = _filtered;
    if (visible.isEmpty) {
      return Center(child: Text('No orders here yet.',
          style: GoogleFonts.poppins(color: AppColors.textSecondary)));
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
      itemCount: visible.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _AdminOrderCard(
        order: visible[i],
        onStatusChange: _updateStatus,
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: AppColors.maroon,
        labelStyle: GoogleFonts.poppins(
          color: selected ? AppColors.white : AppColors.textSecondary,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          fontSize: 13,
        ),
      ),
    );
  }
}

class _AdminOrderCard extends StatelessWidget {
  const _AdminOrderCard({required this.order, required this.onStatusChange});
  final OrderItem order;
  final Future<void> Function(OrderItem, OrderStatus) onStatusChange;

  Color _color(OrderStatus s) {
    switch (s) {
      case OrderStatus.pending: return const Color(0xFFB45309);
      case OrderStatus.processing: return const Color(0xFF8B4513);
      case OrderStatus.delivered: return const Color(0xFF2E7D32);
      case OrderStatus.inTransit: return const Color(0xFF8D6E63);
    }
  }

  String _label(OrderStatus s) {
    switch (s) {
      case OrderStatus.pending: return 'Pending';
      case OrderStatus.processing: return 'Processing';
      case OrderStatus.delivered: return 'Delivered';
      case OrderStatus.inTransit: return 'In Transit';
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = _color(order.status);
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(
            color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(order.id.substring(0, 8).toUpperCase(),
              style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 14))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
                color: c.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
            child: Text(_label(order.status),
                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w700, color: c)),
          ),
        ]),
        const SizedBox(height: 4),
        Text('${order.title}  ·  ${order.dateLabel}',
            style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
        Text('₹${order.total}',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 15)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 6,
          children: [
            for (final s in [OrderStatus.pending, OrderStatus.processing, OrderStatus.delivered])
              _StatusBtn(
                label: _label(s), color: _color(s),
                active: order.status == s,
                onTap: () => onStatusChange(order, s),
              ),
          ],
        ),
      ]),
    );
  }
}

class _StatusBtn extends StatelessWidget {
  const _StatusBtn({required this.label, required this.color, required this.active, required this.onTap});
  final String label;
  final Color color;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: active ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? color : color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(label,
            style: GoogleFonts.poppins(
                fontSize: 11, fontWeight: FontWeight.w600,
                color: active ? Colors.white : color)),
      ),
    );
  }
}

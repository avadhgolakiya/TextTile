import 'package:supabase_flutter/supabase_flutter.dart';

import '../../models/order.dart';
import '../../models/product.dart';

/// Manages orders in the Supabase `orders` table.
class OrderRepository {
  SupabaseClient get _client => Supabase.instance.client;

  static const _months = [
    '', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')} ${_months[d.month]} ${d.year}';

  // ── Helpers ────────────────────────────────────────────────────────────────

  OrderItem _fromRow(Map<String, dynamic> row) {
    final items = (row['items'] as List? ?? []);
    final firstItem = items.isNotEmpty
        ? items.first as Map<String, dynamic>
        : <String, dynamic>{};
    final extraCount = items.length - 1;
    final title = items.isEmpty
        ? 'Order'
        : extraCount > 0
            ? '${firstItem['name']} & $extraCount more'
            : '${firstItem['name']}';

    final createdAt = DateTime.tryParse(row['created_at'] as String? ?? '') ??
        DateTime.now();

    return OrderItem(
      id: row['id'] as String,
      dateLabel: _formatDate(createdAt),
      title: title,
      itemCountLabel:
          '${items.length} item${items.length == 1 ? '' : 's'}',
      total: row['total'] as int,
      thumbnailUrl: (firstItem['imageUrl'] as String?) ?? '',
      status: _statusFromString(row['status'] as String? ?? 'pending'),
    );
  }

  OrderStatus _statusFromString(String s) {
    switch (s) {
      case 'processing': return OrderStatus.processing;
      case 'inTransit':  return OrderStatus.inTransit;
      case 'delivered':  return OrderStatus.delivered;
      default:           return OrderStatus.pending;
    }
  }

  String _statusToString(OrderStatus s) {
    switch (s) {
      case OrderStatus.processing: return 'processing';
      case OrderStatus.inTransit:  return 'inTransit';
      case OrderStatus.delivered:  return 'delivered';
      case OrderStatus.pending:    return 'pending';
    }
  }

  // ── Buyer ──────────────────────────────────────────────────────────────────

  /// Fetch orders belonging to the currently logged-in buyer.
  Future<List<OrderItem>> fetchByBuyer(String buyerId) async {
    final rows = await _client
        .from('orders')
        .select()
        .eq('buyer_id', buyerId)
        .order('created_at', ascending: false);
    return (rows as List)
        .map((r) => _fromRow(r as Map<String, dynamic>))
        .toList();
  }

  /// Save a WhatsApp order to Supabase after opening WhatsApp.
  Future<void> create({
    required String buyerId,
    required String buyerName,
    String? buyerPhone,
    required List<CartLine> lines,
    required int total,
  }) async {
    final items = lines.map((l) => {
      'name': l.product.name,
      'code': l.product.id,
      'qty': l.quantity,
      'price': l.product.price,
      'imageUrl': l.product.imageUrl,
    }).toList();

    await _client.from('orders').insert({
      'buyer_id': buyerId,
      'buyer_name': buyerName,
      if (buyerPhone != null && buyerPhone.isNotEmpty) 'buyer_phone': buyerPhone,
      'items': items,
      'total': total,
      'status': 'pending',
    });
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  /// Fetch ALL orders (admin only — protected by RLS).
  Future<List<OrderItem>> fetchAll() async {
    final rows = await _client
        .from('orders')
        .select()
        .order('created_at', ascending: false);
    return (rows as List)
        .map((r) => _fromRow(r as Map<String, dynamic>))
        .toList();
  }

  /// Update order status (admin).
  Future<void> updateStatus(String orderId, OrderStatus status) async {
    await _client
        .from('orders')
        .update({'status': _statusToString(status)})
        .eq('id', orderId);
  }
}

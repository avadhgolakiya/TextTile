enum OrderStatus { pending, processing, inTransit, delivered }

class OrderItem {
  const OrderItem({
    required this.id,
    required this.dateLabel,
    required this.title,
    required this.itemCountLabel,
    required this.total,
    required this.thumbnailUrl,
    required this.status,
  });

  final String id;
  final String dateLabel;
  final String title;
  final String itemCountLabel;
  final int total;
  final String thumbnailUrl;
  final OrderStatus status;
}

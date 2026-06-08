import { Router } from 'express';
import { getCollection } from '../db.js';
import { authMiddleware } from '../lib/auth.js';
import { ObjectId } from 'mongodb';

const router = Router();

const months = [
  '',
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

function formatDate(d) {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${months[date.getMonth() + 1]} ${date.getFullYear()}`;
}

function mapOrder(doc) {
  const items = doc.items ?? [];
  const first = items[0] ?? {};
  const extra = items.length - 1;
  const title =
    items.length === 0
      ? 'Order'
      : extra > 0
        ? `${first.name} & ${extra} more`
        : first.name;

  return {
    id: doc._id.toString(),
    dateLabel: formatDate(doc.createdAt),
    title,
    itemCountLabel: `${items.length} item${items.length === 1 ? '' : 's'}`,
    total: doc.total,
    thumbnailUrl: first.imageUrl ?? '',
    status: doc.status ?? 'pending',
  };
}

/** Port of OrderRepository.fetchAll for Admin */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ordersColl = getCollection('orders');
    const docs = await ordersColl.find().sort({ createdAt: -1 }).toArray();
    return res.json({ orders: docs.map(mapOrder) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Port of OrderRepository.fetchByBuyer */
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const ordersColl = getCollection('orders');
    const docs = await ordersColl
      .find({ buyerId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ orders: docs.map(mapOrder) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Port of OrderRepository.create */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { buyerName, buyerPhone, lines, total } = req.body || {};
    if (!buyerName || !Array.isArray(lines) || total == null) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const productIds = lines.map((l) => l.productId);
    const productsColl = getCollection('products');
    
    // Convert string IDs if we search in custom _id field
    const products = await productsColl
      .find({ _id: { $in: productIds } })
      .toArray();
    const byId = Object.fromEntries(products.map((p) => [p._id, p]));

    const items = lines.map((line) => {
      const p = byId[line.productId];
      return {
        name: p?.name ?? 'Item',
        code: line.productId,
        qty: line.quantity,
        price: p?.price ?? 0,
        imageUrl: p?.imageUrl ?? '',
      };
    });

    const ordersColl = getCollection('orders');
    await ordersColl.insertOne({
      buyerId: req.userId,
      buyerName,
      buyerPhone: buyerPhone || null,
      items,
      total,
      status: 'pending',
      createdAt: new Date(),
    });

    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Update Order Status for Admin */
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const ordersColl = getCollection('orders');
    await ordersColl.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

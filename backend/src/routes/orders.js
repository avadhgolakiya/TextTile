import { Router } from 'express';
import { getCollection } from '../db.js';
import { authMiddleware } from '../lib/auth.js';
import { logActivity } from '../lib/activity.js';
import { notifyLowStock } from '../lib/notifications.js';
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
    buyerName: doc.buyerName,
    isManual: doc.isManual ?? false,
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

    const usersColl = getCollection('users');
    const userDoc = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!userDoc) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (userDoc.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked. You cannot place orders.' });
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

    // Decrement stock and check for low stock
    for (const line of lines) {
      const p = byId[line.productId];
      if (p && p.stock !== undefined) {
        const oldStock = p.stock || 0;
        const newStock = Math.max(0, oldStock - line.quantity);
        await productsColl.updateOne(
          { _id: line.productId },
          { $set: { stock: newStock } }
        );
        
        if (oldStock > 10 && newStock > 0 && newStock <= 10) {
          notifyLowStock({ ...p, stock: newStock }).catch((err) =>
            console.error('[FCM] notifyLowStock failed:', err),
          );
        }
      }
    }

    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Create Manual Order (Admin Only) */
router.post('/manual', authMiddleware, async (req, res) => {
  try {
    const { buyerName, itemName, quantity, price, imageUrl } = req.body || {};
    if (!buyerName || !itemName || !quantity || price == null) {
      return res.status(400).json({ error: 'buyerName, itemName, quantity, and price are required' });
    }

    const usersColl = getCollection('users');
    const userDoc = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!userDoc || !userDoc.isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }

    const qty = Number(quantity);
    const prc = Number(price);
    const total = qty * prc;

    const items = [{
      name: String(itemName).trim(),
      code: 'MANUAL',
      qty,
      price: prc,
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
    }];

    const ordersColl = getCollection('orders');
    await ordersColl.insertOne({
      buyerId: req.userId, // Storing admin's ID as the creator
      buyerName: String(buyerName).trim(),
      buyerPhone: null,
      items,
      total,
      status: 'pending',
      isManual: true,
      createdAt: new Date(),
    });

    await logActivity(req, 'created_manual_order', { buyerName, total });

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
    
    await logActivity(req, 'updated_order_status', { orderId: req.params.id, status });
    
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

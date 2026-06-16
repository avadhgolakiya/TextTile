import { Router } from 'express';
import { getCollection } from '../db.js';
import { authMiddleware, mapProduct } from '../lib/auth.js';
import { notifyNewProduct, notifyLowStock } from '../lib/notifications.js';
import { logActivity } from '../lib/activity.js';

const router = Router();

/** Port of ProductRepository buyer queries */
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    const admin = req.query.admin === 'true';
    const filter = {};

    if (!admin) {
      filter.isVisible = true;
    }

    if (category) {
      filter.categoryKey = { $regex: new RegExp(`^${String(category).trim()}$`, 'i') };
    }

    const productsColl = getCollection('products');
    const docs = await productsColl
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ products: docs.map(mapProduct) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/featured', async (_req, res) => {
  try {
    const productsColl = getCollection('products');
    const docs = await productsColl
      .find({ isFeatured: true, isVisible: true })
      .sort({ createdAt: -1 })
      .toArray();
    return res.json({ products: docs.map(mapProduct) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productsColl = getCollection('products');
    const doc = await productsColl.findOne({ _id: req.params.id, isVisible: true });
    if (!doc) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product: mapProduct(doc) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

/** Admin CRUD — protect with authMiddleware */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const p = req.body?.product;
    if (!p?.id || !p?.name) {
      return res.status(400).json({ error: 'Invalid product payload' });
    }

    const productsColl = getCollection('products');
    const existingProduct = await productsColl.findOne({ _id: p.id });
    const isNewProduct = !existingProduct;

    const result = await productsColl.updateOne(
      { _id: p.id },
      {
        $set: {
          name: p.name,
          subtitle: p.subtitle ?? '',
          price: p.price ? Number(p.price) : null,
          originalPrice: p.originalPrice ?? null,
          imageUrl: p.imageUrl ?? '',
          imageUrls: p.imageUrls ?? [],
          badge: p.badge ?? null,
          categoryKey: p.categoryKey ?? null,
          isFeatured: req.body.isFeatured ?? false,
          isVisible: p.isVisible ?? true,
          sareeSet: p.sareeSet ?? null,
          stock: p.stock != null ? Number(p.stock) : 0,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    if (isNewProduct && (p.isVisible ?? true)) {
      notifyNewProduct(p).catch((err) =>
        console.error('[FCM] notifyNewProduct failed:', err),
      );
    } else if (!isNewProduct && existingProduct) {
      // Check low stock
      const oldStock = existingProduct.stock ?? 0;
      const newStock = p.stock != null ? Number(p.stock) : 0;
      if (oldStock > 10 && newStock > 0 && newStock <= 10) {
        notifyLowStock({ ...existingProduct, ...p }).catch((err) =>
          console.error('[FCM] notifyLowStock failed:', err),
        );
      }
    }

    await logActivity(req, isNewProduct ? 'created_product' : 'updated_product', { productId: p.id, name: p.name });

    return res.json({ ok: true, isNew: isNewProduct });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productsColl = getCollection('products');
    const doc = await productsColl.findOne({ _id: req.params.id });
    await productsColl.deleteOne({ _id: req.params.id });
    
    await logActivity(req, 'deleted_product', { productId: req.params.id, name: doc?.name });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const { isVisible } = req.body || {};
    const productsColl = getCollection('products');
    await productsColl.updateOne(
      { _id: req.params.id },
      { $set: { isVisible: !!isVisible, updatedAt: new Date() } }
    );
    
    await logActivity(req, 'updated_product_visibility', { productId: req.params.id, isVisible });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/featured', authMiddleware, async (req, res) => {
  try {
    const { isFeatured } = req.body || {};
    const productsColl = getCollection('products');
    await productsColl.updateOne(
      { _id: req.params.id },
      { $set: { isFeatured: !!isFeatured, updatedAt: new Date() } }
    );
    
    await logActivity(req, 'updated_product_featured', { productId: req.params.id, isFeatured });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/notify', authMiddleware, async (req, res) => {
  try {
    const productsColl = getCollection('products');
    const doc = await productsColl.findOne({ _id: req.params.id });
    if (!doc) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Map to the object shape expected by notifyNewProduct
    // It uses id or _id, name, subtitle, price
    await notifyNewProduct(doc);
    
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

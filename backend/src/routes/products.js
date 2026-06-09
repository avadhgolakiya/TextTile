import { Router } from 'express';
import { getCollection } from '../db.js';
import { authMiddleware, mapProduct } from '../lib/auth.js';
import { notifyNewProduct } from '../lib/notifications.js';

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
    console.log('[API] POST /api/products received product:', p?.id, '-', p?.name);
    if (!p?.id || !p?.name || p.price == null) {
      console.warn('[API] Invalid product payload:', p);
      return res.status(400).json({ error: 'Invalid product payload' });
    }

    const productsColl = getCollection('products');
    const result = await productsColl.updateOne(
      { _id: p.id },
      {
        $set: {
          name: p.name,
          subtitle: p.subtitle ?? '',
          price: p.price,
          originalPrice: p.originalPrice ?? null,
          imageUrl: p.imageUrl ?? '',
          imageUrls: p.imageUrls ?? [],
          badge: p.badge ?? null,
          categoryKey: p.categoryKey ?? null,
          isFeatured: req.body.isFeatured ?? false,
          isVisible: p.isVisible ?? true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    const isNewProduct = result.upsertedCount > 0;
    console.log('[API] Product upsert result:', {
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      isNewProduct,
    });

    if (isNewProduct && (p.isVisible ?? true)) {
      console.log('[FCM] Attempting to send push notification...');
      notifyNewProduct(p).catch((err) =>
        console.error('[FCM] notifyNewProduct failed:', err),
      );
    } else {
      console.log('[FCM] Skipping push notification. isNewProduct:', isNewProduct, 'isVisible:', p.isVisible);
    }

    return res.json({ ok: true, isNew: isNewProduct });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productsColl = getCollection('products');
    await productsColl.deleteOne({ _id: req.params.id });
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
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

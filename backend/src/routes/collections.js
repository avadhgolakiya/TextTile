import { Router } from 'express';
import { getCollection } from '../db.js';
import crypto from 'crypto';

const router = Router();

function generateShortId(length = 6) {
  return crypto.randomBytes(length).toString('base64url').substring(0, length);
}

// Create a new shared collection
router.post('/', async (req, res) => {
  try {
    const { productIds } = req.body || {};
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'productIds array is required' });
    }

    const coll = getCollection('shared_collections');
    
    // Generate a unique short ID
    let id;
    let isUnique = false;
    for (let i = 0; i < 5; i++) {
      id = generateShortId();
      const existing = await coll.findOne({ _id: id });
      if (!existing) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique collection ID' });
    }

    await coll.insertOne({
      _id: id,
      productIds,
      createdAt: new Date(),
    });

    return res.json({ id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get a shared collection and its products
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const coll = getCollection('shared_collections');
    const doc = await coll.findOne({ _id: id });

    if (!doc) {
      return res.status(404).json({ error: 'Shared collection not found' });
    }

    const productsColl = getCollection('products');
    const productsCursor = await productsColl.find({ _id: { $in: doc.productIds }, isVisible: true });
    let products = await productsCursor.toArray();

    // Preserve the original order of productIds
    const productMap = new Map(products.map(p => [p._id, p]));
    const orderedProducts = doc.productIds.map(pid => productMap.get(pid)).filter(Boolean);

    return res.json({ products: orderedProducts.map(p => ({ ...p, id: p._id })) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

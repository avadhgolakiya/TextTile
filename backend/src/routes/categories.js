import { Router } from 'express';
import { getCollection } from '../db.js';
import { authMiddleware } from '../lib/auth.js';
import { logActivity } from '../lib/activity.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const categoriesColl = getCollection('categories');
    let docs = await categoriesColl.find().toArray();
    if (docs.length === 0) {
      // Seed default categories
      const defaults = [
        { _id: 'sarees', name: 'Sarees', icon: '🥻' },
        { _id: 'suits', name: 'Suits', icon: '👗' },
        { _id: 'lehenga', name: 'Lehenga', icon: '✨' },
      ];
      await categoriesColl.insertMany(defaults);
      docs = defaults;
    }
    return res.json({
      categories: docs.map((doc) => ({
        key: doc._id,
        name: doc.name,
        icon: doc.icon,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, icon } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const key = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!key) {
      return res.status(400).json({ error: 'Invalid category name' });
    }

    const categoriesColl = getCollection('categories');
    
    // Check if key already exists
    const existing = await categoriesColl.findOne({ _id: key });
    if (existing) {
      return res.status(400).json({ error: `Category "${name}" already exists` });
    }

    await categoriesColl.insertOne({
      _id: key,
      name: name.trim(),
      icon: icon || '✨',
      createdAt: new Date(),
    });

    await logActivity(req, 'added_category', { key, name });

    return res.json({ ok: true, category: { key, name, icon } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const categoriesColl = getCollection('categories');
    
    const doc = await categoriesColl.findOne({ _id: key });
    if (!doc) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await categoriesColl.deleteOne({ _id: key });

    await logActivity(req, 'deleted_category', { key, name: doc.name });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

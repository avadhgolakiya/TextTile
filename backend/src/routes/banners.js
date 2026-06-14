import { Router } from 'express';
import { getCollection } from '../db.js';
import { authMiddleware } from '../lib/auth.js';
import { logActivity } from '../lib/activity.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const bannersColl = getCollection('banners');
    const docs = await bannersColl
      .find()
      .sort({ sortOrder: 1, createdAt: 1 })
      .toArray();
    return res.json({
      urls: docs.map((doc) => doc.imageUrl),
      banners: docs.map((doc) => ({
        id: doc._id.toString(),
        image_url: doc.imageUrl,
        sort_order: doc.sortOrder ?? 0,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { imageUrl, sortOrder } = req.body || {};
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }
    const bannersColl = getCollection('banners');
    await bannersColl.insertOne({
      imageUrl,
      sortOrder: Number(sortOrder || 0),
      createdAt: new Date(),
    });
    
    await logActivity(req, 'added_banner', { imageUrl });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bannersColl = getCollection('banners');
    await bannersColl.deleteOne({ _id: new ObjectId(req.params.id) });
    
    await logActivity(req, 'deleted_banner', { bannerId: req.params.id });
    
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/reorder', authMiddleware, async (req, res) => {
  try {
    const { orderedIds } = req.body || {};
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }

    const bannersColl = getCollection('banners');
    
    // Perform bulk write to update sortOrder for each banner
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: { sortOrder: index } }
      }
    }));

    if (bulkOps.length > 0) {
      await bannersColl.bulkWrite(bulkOps);
    }
    
    await logActivity(req, 'reordered_slider', { count: orderedIds.length });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

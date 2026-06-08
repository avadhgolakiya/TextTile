import { Router } from 'express';
import { getCollection } from '../db.js';
import { authMiddleware } from '../lib/auth.js';
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
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

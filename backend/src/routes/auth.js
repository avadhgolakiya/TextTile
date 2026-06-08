import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getCollection } from '../db.js';
import { authMiddleware, mapUser, signToken } from '../lib/auth.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { businessName, email, password, phone } = req.body || {};
    if (!businessName || !email || !password) {
      return res
        .status(400)
        .json({ error: 'businessName, email, and password are required' });
    }
    const em = String(email).trim().toLowerCase();
    const hash = await bcrypt.hash(String(password), 10);

    const usersColl = getCollection('users');
    const existing = await usersColl.findOne({ email: em });
    if (existing) {
      return res.status(409).json({ error: 'An account already exists for this email.' });
    }

    const doc = {
      email: em,
      passwordHash: hash,
      businessName: String(businessName).trim(),
      phone: phone ? String(phone).trim() : null,
      isAdmin: false,
      createdAt: new Date(),
    };

    const result = await usersColl.insertOne(doc);
    const userDoc = { ...doc, _id: result.insertedId };
    
    const accessToken = signToken(userDoc._id.toString());
    return res.status(201).json({ accessToken, user: mapUser(userDoc) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const em = String(email).trim().toLowerCase();
    const usersColl = getCollection('users');
    const userDoc = await usersColl.findOne({ email: em });
    if (!userDoc) {
      return res.status(401).json({ error: 'No account found for that email.' });
    }
    const ok = await bcrypt.compare(String(password), userDoc.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }
    const accessToken = signToken(userDoc._id.toString());
    return res.json({ accessToken, user: mapUser(userDoc) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const usersColl = getCollection('users');
    const userDoc = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!userDoc) {
      return res.status(401).json({ error: 'User not found' });
    }
    return res.json({ user: mapUser(userDoc) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/buyers', authMiddleware, async (req, res) => {
  try {
    const usersColl = getCollection('users');
    const docs = await usersColl.find({ isAdmin: { $ne: true } }).toArray();
    const ordersColl = getCollection('orders');
    const buyers = await Promise.all(
      docs.map(async (user) => {
        const orderCount = await ordersColl.countDocuments({ buyerId: user._id.toString() });
        return {
          id: user._id.toString(),
          name: user.businessName,
          phone: user.phone || 'No phone',
          orders: orderCount,
        };
      })
    );
    return res.json({ buyers });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from '../db.js';
import { authMiddleware, mapUser, signToken } from '../lib/auth.js';
import { logActivity } from '../lib/activity.js';
import { ObjectId } from 'mongodb';
import { getClientIp, trackUserIp, checkIpBlocked } from '../lib/ipTracker.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, gstin, businessName } = req.body || {};
    if (!name || !email || !password || !mobile || !gstin || !businessName) {
      return res
        .status(400)
        .json({ error: 'name, email, password, mobile, gstin, and businessName are required' });
    }
    const em = String(email).trim().toLowerCase();
    const hash = await bcrypt.hash(String(password), 10);

    const usersColl = getCollection('users');
    const existing = await usersColl.findOne({ email: em });
    if (existing) {
      return res.status(409).json({ error: 'An account already exists for this email.' });
    }

    const doc = {
      name: String(name).trim(),
      email: em,
      passwordHash: hash,
      phone: String(mobile).trim(),
      gstin: String(gstin).trim().toUpperCase(),
      businessName: String(businessName).trim(),
      address: null, // Address can be added later during checkout
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
    const ip = getClientIp(req);
    if (userDoc.isBlocked) {
      await trackUserIp(userDoc._id.toString(), ip, 'login_attempt');
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
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

router.patch('/me/address', authMiddleware, async (req, res) => {
  try {
    const { address } = req.body || {};
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Valid address is required' });
    }
    const usersColl = getCollection('users');
    await usersColl.updateOne(
      { _id: new ObjectId(req.userId) },
      { $set: { address: address.trim(), updatedAt: new Date() } }
    );
    return res.json({ ok: true });
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
          email: user.email,
          phone: user.phone || 'No phone',
          orders: orderCount,
          isBlocked: user.isBlocked ?? false,
        };
      })
    );
    return res.json({ buyers });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/buyers/:id/block', authMiddleware, async (req, res) => {
  try {
    const { isBlocked } = req.body;
    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({ error: 'isBlocked boolean is required' });
    }
    const usersColl = getCollection('users');
    // Ensure caller is admin
    const adminDoc = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!adminDoc || !adminDoc.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updateObj = { isBlocked, updatedAt: new Date() };
    if (isBlocked) {
      updateObj.blockedAt = new Date();

      // Auto-capture all known IPs for this user from user_ip_log
      const userIpLogColl = getCollection('user_ip_log');
      const blockedIpsColl = getCollection('blocked_user_ips');
      
      const knownIps = await userIpLogColl.find({ userId: req.params.id }).toArray();
      if (knownIps.length > 0) {
        const ops = knownIps.map((log) => ({
          updateOne: {
            filter: { ipAddress: log.ipAddress, userId: req.params.id },
            update: {
              $set: {
                userId: req.params.id,
                ipAddress: log.ipAddress,
                auto_detected: true,
                detectedAt: new Date(),
                source: log.source
              }
            },
            upsert: true
          }
        }));
        await blockedIpsColl.bulkWrite(ops);
      }
    } else {
      const blockedIpsColl = getCollection('blocked_user_ips');
      await blockedIpsColl.deleteMany({ userId: req.params.id });
    }

    await usersColl.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateObj }
    );
    
    await logActivity(req, isBlocked ? 'blocked_user' : 'unblocked_user', { targetId: req.params.id });

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin management
router.post('/admins', authMiddleware, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    const usersColl = getCollection('users');
    const caller = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!caller || caller.email !== 'admin@example.com') {
      return res.status(403).json({ error: 'Super Admin access required.' });
    }

    const em = String(email).trim().toLowerCase();
    const existing = await usersColl.findOne({ email: em });
    if (existing) {
      return res.status(409).json({ error: 'Account already exists for this email.' });
    }

    const hash = await bcrypt.hash(String(password), 10);
    const doc = {
      name: String(name).trim(),
      email: em,
      passwordHash: hash,
      phone: null,
      gstin: null,
      businessName: 'System Admin',
      address: null,
      isAdmin: true,
      createdAt: new Date(),
    };

    const result = await usersColl.insertOne(doc);
    await logActivity(req, 'created_admin', { newAdminEmail: em, newAdminId: result.insertedId.toString() });

    return res.status(201).json({ ok: true, admin: { id: result.insertedId.toString(), email: em, name: doc.name } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admins', authMiddleware, async (req, res) => {
  try {
    const usersColl = getCollection('users');
    const caller = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!caller || caller.email !== 'admin@example.com') {
      return res.status(403).json({ error: 'Super Admin access required.' });
    }

    const admins = await usersColl.find({ isAdmin: true }).toArray();
    return res.json({
      admins: admins.map(a => ({
        id: a._id.toString(),
        email: a.email,
        name: a.name || a.businessName,
      }))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admins/:id/activity', authMiddleware, async (req, res) => {
  try {
    const usersColl = getCollection('users');
    const caller = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!caller || caller.email !== 'admin@example.com') {
      return res.status(403).json({ error: 'Super Admin access required.' });
    }

    const activityColl = getCollection('activity_logs');
    const logs = await activityColl.find({ adminId: req.params.id }).sort({ createdAt: -1 }).toArray();
    
    return res.json({ logs: logs.map(l => ({ ...l, id: l._id.toString() })) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/check-ip', async (req, res) => {
  try {
    const ip = req.query.ip || getClientIp(req);
    let blocked = await checkIpBlocked(ip);
    
    if (blocked) {
      const h = req.headers.authorization;
      if (h && h.startsWith('Bearer ')) {
        const token = h.slice(7);
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          const usersColl = getCollection('users');
          const user = await usersColl.findOne({ _id: new ObjectId(payload.sub) });
          if (user && user.isAdmin) {
            blocked = false; // Admins bypass the block
          }
        } catch (err) {}
      }
    }

    return res.json({ blocked });
  } catch (err) {
    return res.json({ blocked: false });
  }
});

router.get('/buyers/:id/ips', authMiddleware, async (req, res) => {
  try {
    const usersColl = getCollection('users');
    const adminDoc = await usersColl.findOne({ _id: new ObjectId(req.userId) });
    if (!adminDoc || !adminDoc.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const userIpLogColl = getCollection('user_ip_log');
    const ips = await userIpLogColl.find({ userId: req.params.id }).toArray();
    
    return res.json({ ips: ips.map(i => ({ id: i._id.toString(), ipAddress: i.ipAddress, detectedAt: i.detectedAt, source: i.source })) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;

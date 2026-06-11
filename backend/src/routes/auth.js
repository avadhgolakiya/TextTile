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

router.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    // Verify token with Google's API via fetch (avoids extra dependency)
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const payload = await googleRes.json();
    const googleClientId = '1069466589231-stup0l4vshllutbjudvjq9fogokdpg7s.apps.googleusercontent.com';
    
    // Verify client ID audience matches
    if (payload.aud !== googleClientId) {
      return res.status(401).json({ error: 'Invalid token audience (Client ID mismatch)' });
    }

    const email = String(payload.email).trim().toLowerCase();
    const name = payload.name || email.split('@')[0];

    const usersColl = getCollection('users');
    let userDoc = await usersColl.findOne({ email });

    if (!userDoc) {
      // Create account automatically if it doesn't exist
      const doc = {
        email,
        businessName: name, // Default business name to Google name
        phone: null,
        isAdmin: false,
        createdAt: new Date(),
        passwordHash: '', 
      };
      const result = await usersColl.insertOne(doc);
      userDoc = { ...doc, _id: result.insertedId };
    }

    const accessToken = signToken(userDoc._id.toString());
    return res.json({ accessToken, user: mapUser(userDoc) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error during Google auth' });
  }
});

router.post('/facebook-login', async (req, res) => {
  try {
    const { accessToken: fbAccessToken } = req.body || {};
    if (!fbAccessToken) {
      return res.status(400).json({ error: 'accessToken is required' });
    }

    const fbAppId = '2064272007513102';
    const fbAppSecret = '82603e1d406dc05ca64579d5d7305dbc';

    // Step 1: Verify the token is valid and belongs to our app
    const appTokenRes = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${fbAppId}&client_secret=${fbAppSecret}&grant_type=client_credentials`
    );
    const appTokenData = await appTokenRes.json();
    if (!appTokenData.access_token) {
      return res.status(500).json({ error: 'Could not obtain Facebook app token' });
    }

    const debugRes = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(fbAccessToken)}&access_token=${encodeURIComponent(appTokenData.access_token)}`
    );
    const debugData = await debugRes.json();
    if (!debugData.data || !debugData.data.is_valid || debugData.data.app_id !== fbAppId) {
      return res.status(401).json({ error: 'Invalid Facebook access token' });
    }

    // Step 2: Fetch user email and name from Graph API
    const meRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(fbAccessToken)}`
    );
    const meData = await meRes.json();
    if (!meData.id) {
      return res.status(401).json({ error: 'Could not fetch Facebook user profile' });
    }

    const email = meData.email
      ? String(meData.email).trim().toLowerCase()
      : `fb_${meData.id}@facebook.noreply`;
    const name = meData.name || email.split('@')[0];

    const usersColl = getCollection('users');
    let userDoc = await usersColl.findOne({ $or: [{ email }, { facebookId: meData.id }] });

    if (!userDoc) {
      const doc = {
        email,
        businessName: name,
        phone: null,
        isAdmin: false,
        createdAt: new Date(),
        passwordHash: '',
        facebookId: meData.id,
      };
      const result = await usersColl.insertOne(doc);
      userDoc = { ...doc, _id: result.insertedId };
    } else if (!userDoc.facebookId) {
      // Link Facebook ID to existing account
      await usersColl.updateOne({ _id: userDoc._id }, { $set: { facebookId: meData.id } });
    }

    const token = signToken(userDoc._id.toString());
    return res.json({ accessToken: token, user: mapUser(userDoc) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error during Facebook auth' });
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

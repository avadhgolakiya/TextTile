import { Router } from 'express';
import { subscribeToNewProducts } from '../lib/notifications.js';
import { isFirebaseConfigured } from '../lib/firebase.js';

const router = Router();

/** Register a browser FCM token and subscribe to new-product alerts. */
router.post('/register-token', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    if (!isFirebaseConfigured()) {
      return res.status(503).json({
        error: 'Push notifications are not configured on the server',
      });
    }

    await subscribeToNewProducts(token.trim());
    return res.json({ ok: true });
  } catch (e) {
    console.error('[FCM] register-token failed:', e);
    return res.status(500).json({ error: 'Failed to register notification token' });
  }
});

router.get('/status', (_req, res) => {
  res.json({ configured: isFirebaseConfigured() });
});

export default router;

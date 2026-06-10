import { Router } from 'express';
import { subscribeToNewProducts } from '../lib/notifications.js';
import { isFirebaseConfigured, getFirebaseDiagnostics } from '../lib/firebase.js';

const router = Router();

/** Register a browser FCM token and subscribe to new-product alerts. */
router.post('/register-token', async (req, res) => {
  try {
    const { token } = req.body || {};
    console.log('[API] POST /api/notifications/register-token received token:', token ? `${token.substring(0, 10)}...` : 'undefined');
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    if (!isFirebaseConfigured()) {
      console.warn('[FCM] Attempted to register token but Firebase is not configured.');
      return res.status(503).json({
        error: 'Push notifications are not configured on the server',
      });
    }

    await subscribeToNewProducts(token.trim());
    console.log('[FCM] Token registered and subscribed successfully.');
    return res.json({ ok: true });
  } catch (e) {
    console.error('[FCM] register-token failed:', e);
    return res.status(500).json({ error: 'Failed to register notification token' });
  }
});

router.get('/status', (_req, res) => {
  res.json(getFirebaseDiagnostics());
});

export default router;

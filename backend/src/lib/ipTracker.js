import { getCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection.remoteAddress || '127.0.0.1';
}

export async function checkIpBlocked(ipAddress) {
  try {
    const blockedIps = getCollection('blocked_user_ips');
    const blocked = await blockedIps.findOne({ ipAddress });
    return !!blocked;
  } catch (err) {
    console.error('Error checking IP block status:', err);
    return false;
  }
}

export async function trackUserIp(userId, ipAddress, source) {
  if (!ipAddress) return;
  try {
    const users = getCollection('users');
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return;

    if (user.isBlocked) {
      const blockedIps = getCollection('blocked_user_ips');
      await blockedIps.updateOne(
        { ipAddress, userId },
        {
          $set: {
            ipAddress,
            userId,
            detectedAt: new Date(),
            source
          }
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Error tracking user IP:', err);
  }
}

export async function globalIpBlocker(req, res, next) {
  if (req.path === '/api/health' || req.path === '/api/auth/check-ip') {
    return next();
  }

  const ip = getClientIp(req);
  const isBlocked = await checkIpBlocked(ip);

  if (isBlocked) {
    return res.status(403).json({ error: 'Your access has been restricted.' });
  }

  // We can optionally decode the token here to track IP without full auth middleware,
  // but let's just do it in the routes or via a hook.
  
  next();
}

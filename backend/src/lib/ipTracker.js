import { getCollection } from '../db.js';
import { ObjectId } from 'mongodb';

import jwt from 'jsonwebtoken';

export function getClientIp(req) {
  let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.headers['x-real-ip'] || 
           req.ip || 
           req.connection?.remoteAddress || 
           '127.0.0.1';
  
  // Normalize IPv4-mapped IPv6 addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
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
    const userIpLog = getCollection('user_ip_log');
    await userIpLog.updateOne(
      { userId, ipAddress },
      {
        $set: {
          userId,
          ipAddress,
          detectedAt: new Date(),
          source
        }
      },
      { upsert: true }
    );
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
    // Check if the user is an admin bypassing the block
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) {
      const token = h.slice(7);
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const users = getCollection('users');
        const user = await users.findOne({ _id: new ObjectId(payload.sub) });
        if (user && user.isAdmin) {
          return next(); // Admins are immune
        }
      } catch (err) {
        // invalid token, proceed to block
      }
    }
    
    return res.status(403).json({ error: 'Your access has been restricted.' });
  }

  next();
}

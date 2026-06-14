import jwt from 'jsonwebtoken';
import { trackUserIp, getClientIp } from './ipTracker.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    
    // Asynchronously track IP
    const ip = getClientIp(req);
    trackUserIp(req.userId, ip, 'api_request').catch(err => console.error('Failed tracking IP:', err));

    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function mapUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name || null,
    businessName: doc.businessName,
    phone: doc.phone || null,
    gstin: doc.gstin || null,
    address: doc.address || null,
    isAdmin: doc.isAdmin ?? false,
    isBlocked: doc.isBlocked ?? false,
    isSuperAdmin: doc.email === 'admin@example.com',
  };
}

export function mapProduct(doc) {
  if (!doc) return null;
  const imageUrl = doc.imageUrl ?? '';
  const rawUrls = Array.isArray(doc.imageUrls) ? doc.imageUrls : [];
  const imageUrls = rawUrls.length ? rawUrls : imageUrl ? [imageUrl] : [];

  return {
    id: doc._id.toString(),
    name: doc.name,
    subtitle: doc.subtitle ?? '',
    price: doc.price,
    originalPrice: doc.originalPrice || null,
    imageUrl,
    imageUrls,
    badge: doc.badge || null,
    categoryKey: doc.categoryKey || null,
    isVisible: doc.isVisible ?? true,
    sareeSet: doc.sareeSet ?? null,
    stock: doc.stock ?? 0,
  };
}

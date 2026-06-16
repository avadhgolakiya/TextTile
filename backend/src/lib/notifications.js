import { getCollection } from '../db.js';
import { getFirebaseAdmin } from './firebase.js';

export const NEW_PRODUCTS_TOPIC = 'new-products';

/** Subscribe an FCM device token to the new-products topic. */
export async function subscribeToNewProducts(token) {
  const admin = getFirebaseAdmin();
  if (!admin) {
    console.warn('[FCM] Firebase Admin not configured — skipping topic subscribe');
    return false;
  }

  await admin.messaging().subscribeToTopic([token], NEW_PRODUCTS_TOPIC);

  const coll = getCollection('fcm_tokens');
  await coll.updateOne(
    { token },
    { $set: { topic: NEW_PRODUCTS_TOPIC, updatedAt: new Date() } },
    { upsert: true },
  );

  return true;
}

/** Send push notification when admin adds a new product. */
export async function notifyNewProduct(product) {
  const admin = getFirebaseAdmin();
  if (!admin) {
    console.warn('[FCM] Firebase Admin not configured — skipping new product notification');
    return false;
  }

  const price = product.price ? `₹${product.price}` : '';
  const body = product.subtitle
    ? `${product.name} — ${product.subtitle}${price ? ` · ${price}` : ''}`
    : `${product.name}${price ? ` · ${price}` : ''}`;

  const frontendUrl = process.env.FRONTEND_URL || 'https://text-tile.vercel.app';
  const productLink = `${frontendUrl.replace(/\/$/, '')}/products/${product.id || product._id || ''}`;

  await admin.messaging().send({
    topic: NEW_PRODUCTS_TOPIC,
    notification: {
      title: '🧵 New saree added — Swastik Fashion',
      body,
    },
    data: {
      type: 'new_product',
      productId: String(product.id || product._id || ''),
      productName: String(product.name || ''),
      link: productLink,
    },
    webpush: {
      fcmOptions: {
        link: productLink,
      },
      notification: {
        icon: `${frontendUrl.replace(/\/$/, '')}/icon-192.png`,
      },
    },
  });

  console.log(`[FCM] Sent new-product notification for "${product.name}"`);
  return true;
}

/** Send push notification when product stock drops to low levels. */
export async function notifyLowStock(product) {
  const admin = getFirebaseAdmin();
  if (!admin) {
    console.warn('[FCM] Firebase Admin not configured — skipping low stock notification');
    return false;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'https://text-tile.vercel.app';
  const productLink = `${frontendUrl.replace(/\/$/, '')}/products/${product.id || product._id || ''}`;

  await admin.messaging().send({
    topic: NEW_PRODUCTS_TOPIC,
    notification: {
      title: `🏃 Hurry! Only ${product.stock} left`,
      body: `${product.name} is almost sold out. Grab yours before it's gone!`,
    },
    data: {
      type: 'low_stock',
      productId: String(product.id || product._id || ''),
      productName: String(product.name || ''),
      link: productLink,
    },
    webpush: {
      fcmOptions: {
        link: productLink,
      },
      notification: {
        icon: `${frontendUrl.replace(/\/$/, '')}/icon-192.png`,
      },
    },
  });

  console.log(`[FCM] Sent low-stock notification for "${product.name}"`);
  return true;
}

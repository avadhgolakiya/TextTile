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

  await admin.messaging().send({
    topic: NEW_PRODUCTS_TOPIC,
    notification: {
      title: '🧵 New saree added — Swastik Fashion',
      body,
      imageUrl: product.imageUrl || undefined,
    },
    data: {
      type: 'new_product',
      productId: String(product.id),
      productName: String(product.name),
      link: `/products/${product.id}`,
    },
    android: {
      priority: 'high',
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      fcmOptions: {
        link: `/products/${product.id}`,
      },
      notification: {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        image: product.imageUrl || undefined,
      },
    },
  });

  console.log(`[FCM] Sent new-product notification for "${product.name}"`);
  return true;
}

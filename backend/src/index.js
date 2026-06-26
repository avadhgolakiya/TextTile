import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { globalIpBlocker } from './lib/ipTracker.js';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import bannerRoutes from './routes/banners.js';
import notificationRoutes from './routes/notifications.js';
import gstRoutes from './routes/gst.js';
import uploadRoutes from './routes/upload.js';
import categoriesRoutes from './routes/categories.js';
import collectionsRoutes from './routes/collections.js';

const PORT = Number(process.env.PORT || 3333);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use(globalIpBlocker);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api', gstRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/collections', collectionsRoutes);

import { connectRedis } from './lib/redis.js';

connectDB()
  .then(() => {
    connectRedis(); // Connect in background, don't block Express startup
    app.listen(PORT, () => {
      console.log(`Saarika API listening on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });


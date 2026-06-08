import 'dotenv/config';
import { connectDB, getCollection, client } from './db.js';

const defaultProducts = [
  {
    _id: 'banarasi-silk-saree',
    name: 'Varanasi Silk Saree',
    subtitle: 'Pure Banarasi silk with gold zari border',
    price: 4500,
    originalPrice: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'],
    badge: 'Best Seller',
    categoryKey: 'banarasi',
    isFeatured: true,
    isVisible: true,
    createdAt: new Date(),
  },
  {
    _id: 'kanjivaram-brocade',
    name: 'Kanchipuram Brocade',
    subtitle: 'Traditional Kanjivaram silk saree with motifs',
    price: 7500,
    originalPrice: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80'],
    badge: 'Premium',
    categoryKey: 'kanjivaram',
    isFeatured: true,
    isVisible: true,
    createdAt: new Date(),
  },
  {
    _id: 'floral-chiffon',
    name: 'Floral Print Chiffon',
    subtitle: 'Lightweight daily wear chiffon saree',
    price: 1200,
    originalPrice: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'],
    badge: '10% OFF',
    categoryKey: 'chiffon',
    isFeatured: false,
    isVisible: true,
    createdAt: new Date(),
  },
  {
    _id: 'designer-georgette',
    name: 'Designer Faux Georgette',
    subtitle: 'Embellished georgette saree for parties',
    price: 2800,
    originalPrice: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1583391265517-35bbdba0122a?w=600&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1583391265517-35bbdba0122a?w=600&q=80'],
    badge: 'New Arrival',
    categoryKey: 'georgette',
    isFeatured: true,
    isVisible: true,
    createdAt: new Date(),
  },
];

const defaultBanners = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80',
    sortOrder: 1,
    createdAt: new Date(),
  },
];

async function main() {
  console.log('Connecting to database...');
  await connectDB();

  console.log('Setting up collections and indexes...');
  
  const usersColl = getCollection('users');
  await usersColl.createIndex({ email: 1 }, { unique: true });

  const productsColl = getCollection('products');
  await productsColl.createIndex({ categoryKey: 1 });
  await productsColl.createIndex({ isVisible: 1, isFeatured: 1 });

  const bannersColl = getCollection('banners');
  await bannersColl.createIndex({ sortOrder: 1, createdAt: 1 });

  const ordersColl = getCollection('orders');
  await ordersColl.createIndex({ buyerId: 1, createdAt: -1 });

  // Seed Banners if empty
  const bannerCount = await bannersColl.countDocuments();
  if (bannerCount === 0) {
    console.log('Seeding default banners...');
    await bannersColl.insertMany(defaultBanners);
  }

  // Seed Products if empty
  const productCount = await productsColl.countDocuments();
  if (productCount === 0) {
    console.log('Seeding default products...');
    await productsColl.insertMany(defaultProducts);
  }

  console.log('MongoDB initialization and seeding OK');
  await client.close();
}

main().catch((e) => {
  console.error(e);
  client.close().catch(() => {});
  process.exit(1);
});

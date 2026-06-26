import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.DATABASE_URL;

if (!MONGO_URI) {
  throw new Error('DATABASE_URL is required');
}

// Create MongoDB Client
export const client = new MongoClient(MONGO_URI);

let db = null;

export async function createIndexes() {
  try {
    const products = getCollection('products');
    // Index for general product query: isVisible + createdAt
    await products.createIndex({ isVisible: 1, createdAt: -1 });
    // Index for category query: categoryKey + isVisible + createdAt
    await products.createIndex({ categoryKey: 1, isVisible: 1, createdAt: -1 });
    // Index for featured query: isFeatured + isVisible + createdAt
    await products.createIndex({ isFeatured: 1, isVisible: 1, createdAt: -1 });
    console.log('MongoDB Indexes verified/created successfully');
  } catch (err) {
    console.error('Failed to create MongoDB indexes:', err);
  }
}

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db('saarika');
  console.log('Successfully connected to MongoDB');
  await createIndexes();
  return db;
}

export function getCollection(name) {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db.collection(name);
}

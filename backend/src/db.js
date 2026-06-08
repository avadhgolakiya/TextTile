import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.DATABASE_URL;

if (!MONGO_URI) {
  throw new Error('DATABASE_URL is required');
}

// Create MongoDB Client
export const client = new MongoClient(MONGO_URI);

let db = null;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db('saarika');
  console.log('Successfully connected to MongoDB');
  return db;
}

export function getCollection(name) {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db.collection(name);
}

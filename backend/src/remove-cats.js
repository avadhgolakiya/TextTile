import 'dotenv/config';
import { connectDB, getCollection, client } from './db.js';

async function main() {
  await connectDB();
  const productsColl = getCollection('products');

  const categoriesToRemove = ['cotton', 'banarasi', 'kanjivaram', 'saree', 'sarees'];

  const result = await productsColl.updateMany(
    { categoryKey: { $in: categoriesToRemove.map(c => new RegExp(`^${c}$`, 'i')) } },
    { $set: { categoryKey: '' } }
  );

  console.log(`Updated ${result.modifiedCount} products. Categories removed.`);
  await client.close();
}

main().catch(console.error);

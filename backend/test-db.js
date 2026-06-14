import { MongoClient } from 'mongodb';
const uri = "mongodb+srv://avadhgolakiya88_db_user:avadh1234@cluster0.an4widn.mongodb.net";
const client = new MongoClient(uri);
async function run() {
  await client.connect();
  const db = client.db('textile_db');
  const products = await db.collection('products').find({}).toArray();
  console.log("Total products:", products.length);
  const categories = products.map(p => p.categoryKey);
  console.log("Categories:", [...new Set(categories)]);
  await client.close();
}
run().catch(console.error);

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, getCollection, client } from './db.js';

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const businessName = args[2] || 'Swastik Admin';

  if (!email) {
    console.error('Usage: node src/create-admin.js <email> [password] [businessName]');
    console.error('Example: node src/create-admin.js admin@example.com password123 "Swastik Admin"');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await connectDB();

  const usersColl = getCollection('users');
  const em = String(email).trim().toLowerCase();
  
  const existing = await usersColl.findOne({ email: em });

  if (existing) {
    console.log(`User "${em}" already exists. Promoting to admin...`);
    await usersColl.updateOne({ email: em }, { $set: { isAdmin: true } });
    console.log(`User "${em}" is now an Admin!`);
  } else {
    if (!password) {
      console.error('Error: Password is required to create a new user account.');
      await client.close();
      process.exit(1);
    }
    console.log(`Creating new admin user: "${em}"...`);
    const hash = await bcrypt.hash(String(password), 10);
    
    const doc = {
      email: em,
      passwordHash: hash,
      businessName: String(businessName).trim(),
      phone: null,
      isAdmin: true,
      createdAt: new Date(),
    };
    
    await usersColl.insertOne(doc);
    console.log(`Admin user "${em}" created successfully!`);
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  client.close().catch(() => {});
  process.exit(1);
});

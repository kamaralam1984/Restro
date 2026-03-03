/**
 * Seed default menu items for all restaurants that currently
 * have no menu items. Uses the same default set used when
 * new restaurants are created.
 *
 * Run: npm run seed-menu-default-all
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Restaurant } from '../models/Restaurant.model';
import { Menu } from '../models/Menu.model';
import { seedDefaultMenuForRestaurant } from '../services/defaultMenu.service';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restro-os';

async function seedForExisting() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const restaurants = await Restaurant.find().select('_id name slug').lean();
  console.log(`Found ${restaurants.length} restaurants.`);

  for (const r of restaurants) {
    const count = await Menu.countDocuments({ restaurantId: r._id, isDeleted: { $ne: true } });
    if (count > 0) {
      console.log(`Skipping ${r.name} (${r.slug}) — already has ${count} menu items.`);
      continue;
    }
    console.log(`Seeding default menu for ${r.name} (${r.slug})...`);
    try {
      await seedDefaultMenuForRestaurant(r._id as any);
      console.log(`✅ Seeded default menu for ${r.name}`);
    } catch (err: any) {
      console.error(`❌ Failed to seed ${r.name}:`, err?.message || err);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seedForExisting().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});


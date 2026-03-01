import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Menu } from '../models/Menu.model';

dotenv.config();

async function verifyMenuItems() {
  try {
    await connectDB();
    console.log('📦 Connected to database\n');

    const categories = ['appetizer', 'main', 'dessert', 'beverage', 'salad', 'soup'];
    
    console.log('📊 Final Menu Summary:\n');
    for (const cat of categories) {
      const count = await Menu.countDocuments({ category: cat, available: true });
      console.log(`  ${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${count} items`);
    }
    
    const total = await Menu.countDocuments({ available: true });
    console.log(`\n✅ Total: ${total} items\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyMenuItems();


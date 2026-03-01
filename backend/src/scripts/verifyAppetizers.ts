import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Menu } from '../models/Menu.model';

dotenv.config();

async function verifyAppetizers() {
  try {
    await connectDB();
    console.log('📦 Connected to database\n');

    const items = await Menu.find({ category: 'appetizer' }).sort({ name: 1 });

    console.log('📋 Appetizer Items in Database:\n');
    items.forEach((item, i) => {
      console.log(
        `${i + 1}. ${item.name} - ₹${item.price} (Available: ${item.available ? 'Yes' : 'No'})`
      );
    });
    console.log(`\n✅ Total: ${items.length} items\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAppetizers();


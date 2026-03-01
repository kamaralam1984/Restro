import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Menu } from '../models/Menu.model';

dotenv.config();

// 10 Non-Veg items for main category with images
const nonVegMainItems = [
  {
    name: 'Chicken Butter Masala',
    description: 'Creamy and rich butter masala with tender chicken pieces, cooked in aromatic spices and butter. Served with basmati rice and butter naan.',
    price: 350,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    ingredients: ['Chicken', 'Tomato', 'Butter', 'Cream', 'Spices', 'Onion', 'Garlic', 'Ginger'],
    preparationTime: 25,
    addOns: [
      { name: 'Extra Chicken', price: 80, available: true },
      { name: 'Extra Butter', price: 30, available: true },
      { name: 'Extra Naan', price: 40, available: true },
    ],
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'Tender grilled chicken tikka pieces in a rich, creamy tomato-based curry. A popular Indo-British fusion dish with aromatic spices.',
    price: 360,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80',
    ingredients: ['Chicken Tikka', 'Tomato', 'Cream', 'Spices', 'Onion', 'Garlic', 'Yogurt'],
    preparationTime: 30,
    addOns: [
      { name: 'Extra Chicken Tikka', price: 90, available: true },
      { name: 'Extra Naan', price: 40, available: true },
      { name: 'Extra Rice', price: 25, available: true },
    ],
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, and herbs. Served with raita, pickle, and boiled egg.',
    price: 380,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    ingredients: ['Basmati Rice', 'Chicken', 'Spices', 'Onion', 'Yogurt', 'Mint', 'Coriander', 'Saffron'],
    preparationTime: 35,
    addOns: [
      { name: 'Extra Chicken', price: 80, available: true },
      { name: 'Extra Raita', price: 30, available: true },
      { name: 'Extra Boiled Egg', price: 25, available: true },
    ],
  },
  {
    name: 'Mutton Curry',
    description: 'Tender mutton pieces slow-cooked in a rich, spicy curry with onions, tomatoes, and aromatic spices. A traditional favorite.',
    price: 420,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Mutton', 'Onion', 'Tomato', 'Spices', 'Ginger', 'Garlic', 'Yogurt'],
    preparationTime: 45,
    addOns: [
      { name: 'Extra Mutton', price: 120, available: true },
      { name: 'Extra Naan', price: 40, available: true },
      { name: 'Extra Rice', price: 25, available: true },
    ],
  },
  {
    name: 'Chicken Korma',
    description: 'Mild and creamy chicken curry cooked with yogurt, cream, and aromatic spices. A royal Mughlai delicacy.',
    price: 370,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70946?w=800&q=80',
    ingredients: ['Chicken', 'Yogurt', 'Cream', 'Almonds', 'Spices', 'Onion', 'Ginger', 'Garlic'],
    preparationTime: 30,
    addOns: [
      { name: 'Extra Chicken', price: 80, available: true },
      { name: 'Extra Naan', price: 40, available: true },
      { name: 'Extra Rice', price: 25, available: true },
    ],
  },
  {
    name: 'Fish Curry',
    description: 'Fresh fish cooked in a tangy and spicy curry with coconut, tamarind, and aromatic spices. A coastal delicacy.',
    price: 340,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1544943910-04c54e3fe9ee?w=800&q=80',
    ingredients: ['Fish', 'Coconut', 'Tamarind', 'Spices', 'Onion', 'Tomato', 'Curry Leaves'],
    preparationTime: 25,
    addOns: [
      { name: 'Extra Fish', price: 100, available: true },
      { name: 'Extra Rice', price: 25, available: true },
      { name: 'Extra Curry', price: 50, available: true },
    ],
  },
  {
    name: 'Chicken Rogan Josh',
    description: 'Aromatic chicken curry with a rich, deep red color from Kashmiri red chilies. Slow-cooked to perfection with yogurt and spices.',
    price: 365,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Chicken', 'Yogurt', 'Kashmiri Red Chili', 'Spices', 'Onion', 'Ginger', 'Garlic'],
    preparationTime: 30,
    addOns: [
      { name: 'Extra Chicken', price: 80, available: true },
      { name: 'Extra Naan', price: 40, available: true },
      { name: 'Extra Rice', price: 25, available: true },
    ],
  },
  {
    name: 'Chicken Kadai',
    description: 'Spicy and flavorful chicken curry cooked in a kadai (wok) with bell peppers, onions, and aromatic spices. A restaurant-style favorite.',
    price: 355,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    ingredients: ['Chicken', 'Bell Peppers', 'Onion', 'Tomato', 'Spices', 'Ginger', 'Garlic'],
    preparationTime: 25,
    addOns: [
      { name: 'Extra Chicken', price: 80, available: true },
      { name: 'Extra Naan', price: 40, available: true },
      { name: 'Extra Rice', price: 25, available: true },
    ],
  },
  {
    name: 'Chicken Vindaloo',
    description: 'Fiery hot chicken curry with Portuguese influence, cooked with vinegar, potatoes, and a blend of hot spices. For spice lovers!',
    price: 360,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Chicken', 'Potato', 'Vinegar', 'Red Chili', 'Spices', 'Onion', 'Garlic'],
    preparationTime: 30,
    addOns: [
      { name: 'Extra Chicken', price: 80, available: true },
      { name: 'Extra Naan', price: 40, available: true },
      { name: 'Extra Rice', price: 25, available: true },
    ],
  },
  {
    name: 'Chicken Do Pyaza',
    description: 'Delicious chicken curry with double the onions, cooked in a rich gravy with aromatic spices. A classic Mughlai dish.',
    price: 350,
    category: 'main',
    isVeg: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70946?w=800&q=80',
    ingredients: ['Chicken', 'Onion', 'Tomato', 'Spices', 'Ginger', 'Garlic', 'Yogurt'],
    preparationTime: 28,
    addOns: [
      { name: 'Extra Chicken', price: 80, available: true },
      { name: 'Extra Naan', price: 40, available: true },
      { name: 'Extra Rice', price: 25, available: true },
    ],
  },
];

async function addNonVegMainItems() {
  try {
    await connectDB();
    console.log('📦 Connected to database\n');

    let totalAdded = 0;
    let totalSkipped = 0;

    console.log('🍗 Adding 10 Non-Veg Main Course Items...\n');

    for (const item of nonVegMainItems) {
      // Check if item already exists
      const existing = await Menu.findOne({ 
        name: item.name, 
        category: 'main',
        isVeg: false 
      });
      
      if (existing) {
        console.log(`  ⏭️  Skipped: ${item.name} (already exists)`);
        totalSkipped++;
        continue;
      }

      const menuItem = new Menu(item);
      await menuItem.save();
      console.log(`  ✅ Added: ${item.name} - ₹${item.price}`);
      totalAdded++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully added ${totalAdded} non-veg main items`);
    console.log(`⏭️  Skipped ${totalSkipped} items (already exist)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show summary
    const nonVegMainCount = await Menu.countDocuments({ 
      category: 'main', 
      isVeg: false,
      available: true 
    });
    console.log(`📊 Total Non-Veg Main Items: ${nonVegMainCount}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error adding non-veg main items:', error.message);
    process.exit(1);
  }
}

addNonVegMainItems();


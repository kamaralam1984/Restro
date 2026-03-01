import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Menu } from '../models/Menu.model';

dotenv.config();

const appetizers = [
  {
    name: 'Veg Spring Rolls',
    description: 'Crispy golden spring rolls filled with fresh vegetables, served with sweet and sour sauce. A perfect starter to kick off your meal.',
    price: 180,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Cabbage', 'Carrots', 'Bean Sprouts', 'Spring Onion', 'Wrappers'],
    preparationTime: 15,
    addOns: [
      { name: 'Extra Sauce', price: 20, available: true },
      { name: 'Chilli Sauce', price: 15, available: true },
    ],
  },
  {
    name: 'Paneer Tikka',
    description: 'Succulent cubes of marinated paneer, grilled to perfection with aromatic spices. Served with mint chutney and onion rings.',
    price: 220,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Paneer', 'Yogurt', 'Ginger-Garlic Paste', 'Spices', 'Bell Peppers'],
    preparationTime: 20,
    addOns: [
      { name: 'Extra Paneer', price: 50, available: true },
      { name: 'Extra Mint Chutney', price: 20, available: true },
    ],
  },
  {
    name: 'Paneer Pakora',
    description: 'Crispy deep-fried paneer fritters coated in spiced gram flour batter. Served hot with tangy tamarind chutney.',
    price: 190,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Paneer', 'Gram Flour', 'Spices', 'Onion', 'Coriander'],
    preparationTime: 12,
    addOns: [
      { name: 'Extra Chutney', price: 20, available: true },
      { name: 'Extra Paneer', price: 40, available: true },
    ],
  },
  {
    name: 'Veg Momos',
    description: 'Delicious steamed or fried dumplings stuffed with fresh vegetables and aromatic spices. Served with spicy red chutney and sesame sauce.',
    price: 150,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Cabbage', 'Carrots', 'Onion', 'Ginger', 'Garlic', 'Flour'],
    preparationTime: 18,
    addOns: [
      { name: 'Steamed (6 pcs)', price: 0, available: true },
      { name: 'Fried (6 pcs)', price: 30, available: true },
      { name: 'Extra Momos (6 pcs)', price: 120, available: true },
    ],
  },
  {
    name: 'French Fries',
    description: 'Golden crispy potato fries, perfectly seasoned and served hot. A classic favorite that never goes out of style.',
    price: 120,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Potatoes', 'Salt', 'Oil'],
    preparationTime: 10,
    addOns: [
      { name: 'Cheese Fries', price: 40, available: true },
      { name: 'Peri Peri Fries', price: 30, available: true },
      { name: 'Extra Sauce', price: 20, available: true },
    ],
  },
  {
    name: 'Honey Chilli Potato',
    description: 'Crispy fried potatoes tossed in a sweet and spicy honey chilli sauce with bell peppers and onions. An irresistible Indo-Chinese favorite.',
    price: 200,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Potatoes', 'Honey', 'Chilli Sauce', 'Bell Peppers', 'Onion', 'Garlic'],
    preparationTime: 15,
    addOns: [
      { name: 'Extra Honey', price: 25, available: true },
      { name: 'Extra Spicy', price: 0, available: true },
      { name: 'Extra Vegetables', price: 30, available: true },
    ],
  },
  {
    name: 'Hara Bhara Kabab',
    description: 'Green and healthy kebabs made with spinach, peas, and potatoes, spiced with aromatic herbs. Served with mint chutney.',
    price: 210,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Spinach', 'Green Peas', 'Potatoes', 'Coriander', 'Mint', 'Spices'],
    preparationTime: 20,
    addOns: [
      { name: 'Extra Mint Chutney', price: 20, available: true },
      { name: 'Extra Kababs (2 pcs)', price: 100, available: true },
    ],
  },
  {
    name: 'Crispy Corn',
    description: 'Sweet corn kernels coated in a crispy batter and tossed with spices, onions, and bell peppers. A crunchy and flavorful starter.',
    price: 170,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Sweet Corn', 'Onion', 'Bell Peppers', 'Spices', 'Coriander'],
    preparationTime: 12,
    addOns: [
      { name: 'Extra Corn', price: 40, available: true },
      { name: 'Extra Spicy', price: 0, available: true },
      { name: 'Cheese Topping', price: 30, available: true },
    ],
  },
  {
    name: 'Cheese Balls',
    description: 'Golden fried cheese balls with a crispy exterior and gooey melted cheese inside. Served with ketchup and mayo dip.',
    price: 230,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Mozzarella Cheese', 'Potatoes', 'Bread Crumbs', 'Spices'],
    preparationTime: 15,
    addOns: [
      { name: 'Extra Cheese Balls (2 pcs)', price: 110, available: true },
      { name: 'Extra Dips', price: 25, available: true },
    ],
  },
  {
    name: 'Aloo Tikki',
    description: 'Crispy spiced potato patties, shallow fried to golden perfection. Served with chutneys and chickpeas. A street food classic.',
    price: 140,
    category: 'appetizer',
    isVeg: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ingredients: ['Potatoes', 'Spices', 'Coriander', 'Green Chilli', 'Ginger'],
    preparationTime: 12,
    addOns: [
      { name: 'With Chole', price: 40, available: true },
      { name: 'Extra Tikki (2 pcs)', price: 60, available: true },
      { name: 'Extra Chutney', price: 15, available: true },
    ],
  },
];

async function addAppetizers() {
  try {
    await connectDB();
    console.log('📦 Connected to database');

    let added = 0;
    let skipped = 0;

    for (const item of appetizers) {
      // Check if item already exists
      const existing = await Menu.findOne({ name: item.name, category: 'appetizer' });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${item.name} (already exists)`);
        skipped++;
        continue;
      }

      const menuItem = new Menu(item);
      await menuItem.save();
      console.log(`✅ Added: ${item.name} - ₹${item.price}`);
      added++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully added ${added} appetizer items`);
    console.log(`⏭️  Skipped ${skipped} items (already exist)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error adding appetizers:', error.message);
    process.exit(1);
  }
}

addAppetizers();


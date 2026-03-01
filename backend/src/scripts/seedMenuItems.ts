/**
 * Run: npm run seed-menu
 * Seeds 25 veg + 15 non-veg menu items for the demo restaurant.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restro-os';
const RESTAURANT_SLUG = process.env.SEED_RESTAURANT_SLUG || 'demo-restaurant';

// ── 25 Veg Items ──────────────────────────────────────────────────────────────
const vegItems = [
  // Starters (6)
  {
    name: 'Paneer Tikka',
    description: 'Juicy cottage cheese cubes marinated in spiced yogurt, grilled to perfection in a tandoor. Served with mint chutney.',
    price: 280,
    category: 'starter',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    ingredients: ['Paneer', 'Yogurt', 'Bell Peppers', 'Onion', 'Tandoori Spices', 'Lemon'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Chutney', price: 20, available: true }, { name: 'Extra Paneer', price: 60, available: true }],
  },
  {
    name: 'Veg Spring Rolls',
    description: 'Crispy golden spring rolls stuffed with stir-fried vegetables and glass noodles. Served with sweet chilli sauce.',
    price: 180,
    category: 'starter',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1548507835-dcba9efa0c21?w=800&q=80',
    ingredients: ['Cabbage', 'Carrot', 'Glass Noodles', 'Spring Onion', 'Soy Sauce', 'Ginger'],
    preparationTime: 15,
    addOns: [{ name: 'Extra Sauce', price: 20, available: true }, { name: 'Extra Rolls (2)', price: 90, available: true }],
  },
  {
    name: 'Hara Bhara Kabab',
    description: 'Soft green patties made with spinach, peas, and potato, flavored with herbs. A healthy and delicious starter.',
    price: 220,
    category: 'starter',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80',
    ingredients: ['Spinach', 'Green Peas', 'Potato', 'Cheese', 'Spices', 'Mint', 'Coriander'],
    preparationTime: 18,
    addOns: [{ name: 'Extra Chutney', price: 20, available: true }, { name: 'Extra Kabab (2)', price: 110, available: true }],
  },
  {
    name: 'Stuffed Mushrooms',
    description: 'Plump mushroom caps stuffed with herbed cream cheese and baked until golden. A gourmet vegetarian starter.',
    price: 260,
    category: 'starter',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&q=80',
    ingredients: ['Button Mushrooms', 'Cream Cheese', 'Garlic', 'Herbs', 'Parmesan', 'Olive Oil'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Cheese', price: 30, available: true }, { name: 'Garlic Bread', price: 60, available: true }],
  },
  {
    name: 'Aloo Tikki Chaat',
    description: 'Crispy potato patties topped with chutneys, yogurt, pomegranate seeds and spices. A popular street-style chaat.',
    price: 160,
    category: 'starter',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=800&q=80',
    ingredients: ['Potato', 'Chickpeas', 'Yogurt', 'Tamarind Chutney', 'Mint Chutney', 'Pomegranate'],
    preparationTime: 12,
    addOns: [{ name: 'Extra Yogurt', price: 20, available: true }, { name: 'Extra Chaat Masala', price: 10, available: true }],
  },
  {
    name: 'Veg Seekh Kabab',
    description: 'Minced vegetable and lentil skewers flavored with aromatic spices, grilled on a sigri. Served with raita.',
    price: 240,
    category: 'starter',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    ingredients: ['Mixed Vegetables', 'Lentils', 'Onion', 'Spices', 'Ginger', 'Garlic', 'Coriander'],
    preparationTime: 22,
    addOns: [{ name: 'Extra Raita', price: 25, available: true }, { name: 'Extra Skewer', price: 60, available: true }],
  },

  // Main Course (8)
  {
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy curry with soft paneer cubes in a luscious tomato-butter gravy. Best enjoyed with naan or rice.',
    price: 320,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    ingredients: ['Paneer', 'Tomato', 'Butter', 'Cream', 'Cashews', 'Spices', 'Onion'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Paneer', price: 60, available: true }, { name: 'Extra Butter', price: 30, available: true }, { name: 'Naan', price: 40, available: true }],
  },
  {
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils and kidney beans in a velvety butter-cream gravy. A restaurant classic that never disappoints.',
    price: 250,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&q=80',
    ingredients: ['Black Lentils', 'Kidney Beans', 'Butter', 'Cream', 'Tomato', 'Spices', 'Ginger'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Butter', price: 30, available: true }, { name: 'Naan', price: 40, available: true }, { name: 'Rice', price: 25, available: true }],
  },
  {
    name: 'Palak Paneer',
    description: 'Velvety spinach curry with golden fried paneer cubes. Nutritious, vibrant green and packed with flavors.',
    price: 290,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    ingredients: ['Spinach', 'Paneer', 'Onion', 'Tomato', 'Cream', 'Spices', 'Garlic'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Paneer', price: 60, available: true }, { name: 'Naan', price: 40, available: true }],
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice layered with spiced vegetables, caramelized onions, and saffron. Served with raita and mirch ka salan.',
    price: 280,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Saffron', 'Caramelized Onion', 'Mint', 'Yogurt', 'Spices'],
    preparationTime: 30,
    addOns: [{ name: 'Extra Raita', price: 30, available: true }, { name: 'Extra Salan', price: 40, available: true }],
  },
  {
    name: 'Chana Masala',
    description: 'Hearty chickpeas cooked in a tangy, spiced tomato gravy. A protein-packed dish that goes great with bhature or rice.',
    price: 240,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    ingredients: ['Chickpeas', 'Tomato', 'Onion', 'Spices', 'Ginger', 'Garlic', 'Amchur'],
    preparationTime: 18,
    addOns: [{ name: 'Bhatura', price: 30, available: true }, { name: 'Rice', price: 25, available: true }],
  },
  {
    name: 'Shahi Paneer',
    description: 'Royal Mughlai-style paneer in a rich, aromatic gravy of nuts, cream and whole spices. A celebration on your plate.',
    price: 340,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1630851840628-1a28ab2b1f2e?w=800&q=80',
    ingredients: ['Paneer', 'Cashews', 'Cream', 'Onion', 'Tomato', 'Cardamom', 'Saffron'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Paneer', price: 60, available: true }, { name: 'Sheermal', price: 50, available: true }],
  },
  {
    name: 'Mixed Veg Curry',
    description: 'Seasonal vegetables cooked in a robust, home-style masala gravy. Wholesome, comforting and full of goodness.',
    price: 220,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
    ingredients: ['Potato', 'Cauliflower', 'Peas', 'Carrot', 'Beans', 'Tomato', 'Spices'],
    preparationTime: 20,
    addOns: [{ name: 'Naan', price: 40, available: true }, { name: 'Rice', price: 25, available: true }],
  },
  {
    name: 'Kadai Paneer',
    description: 'Paneer and bell peppers tossed in a spicy, freshly ground kadai masala. Bold flavors, rustic and absolutely satisfying.',
    price: 310,
    category: 'main',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    ingredients: ['Paneer', 'Bell Peppers', 'Onion', 'Tomato', 'Coriander Seeds', 'Red Chilli', 'Garam Masala'],
    preparationTime: 22,
    addOns: [{ name: 'Extra Paneer', price: 60, available: true }, { name: 'Roti', price: 20, available: true }],
  },

  // Breads & Rice (3)
  {
    name: 'Butter Naan',
    description: 'Soft, pillowy leavened bread baked fresh in a tandoor and brushed generously with butter. Perfect with any curry.',
    price: 50,
    category: 'bread',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    ingredients: ['Flour', 'Yeast', 'Butter', 'Milk', 'Salt'],
    preparationTime: 10,
    addOns: [{ name: 'Extra Butter', price: 20, available: true }, { name: 'Garlic', price: 15, available: true }],
  },
  {
    name: 'Jeera Rice',
    description: 'Fragrant basmati rice tempered with cumin seeds, ghee and fresh coriander. A simple yet elegant accompaniment.',
    price: 120,
    category: 'rice',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
    ingredients: ['Basmati Rice', 'Cumin Seeds', 'Ghee', 'Coriander', 'Salt'],
    preparationTime: 15,
    addOns: [{ name: 'Extra Rice', price: 60, available: true }, { name: 'Extra Ghee', price: 25, available: true }],
  },
  {
    name: 'Garlic Naan',
    description: 'Tandoor-baked naan topped with freshly minced garlic, coriander and butter. Aromatic and irresistible.',
    price: 60,
    category: 'bread',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80',
    ingredients: ['Flour', 'Garlic', 'Butter', 'Coriander', 'Yeast', 'Salt'],
    preparationTime: 10,
    addOns: [{ name: 'Extra Garlic Butter', price: 20, available: true }],
  },

  // Desserts (4)
  {
    name: 'Gulab Jamun',
    description: 'Melt-in-your-mouth milk-solid dumplings soaked in rose-cardamom sugar syrup. India\'s most beloved dessert.',
    price: 120,
    category: 'dessert',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
    ingredients: ['Milk Powder', 'Khoya', 'Sugar', 'Rose Water', 'Cardamom', 'Saffron'],
    preparationTime: 15,
    addOns: [{ name: 'Extra Gulab Jamun', price: 60, available: true }, { name: 'Vanilla Ice Cream', price: 60, available: true }],
  },
  {
    name: 'Rasmalai',
    description: 'Delicate cottage cheese discs soaked in chilled saffron-cardamom cream, garnished with pistachios. Pure indulgence.',
    price: 150,
    category: 'dessert',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?w=800&q=80',
    ingredients: ['Cottage Cheese', 'Milk', 'Sugar', 'Cardamom', 'Saffron', 'Pistachios', 'Rose Water'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Rasmalai', price: 75, available: true }, { name: 'Extra Nuts', price: 30, available: true }],
  },
  {
    name: 'Mango Kulfi',
    description: 'Traditional Indian ice cream made with reduced milk and fresh alphonso mango pulp. Creamy, dense and refreshingly cold.',
    price: 140,
    category: 'dessert',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&q=80',
    ingredients: ['Reduced Milk', 'Mango Pulp', 'Sugar', 'Cardamom', 'Pistachios', 'Saffron'],
    preparationTime: 5,
    addOns: [{ name: 'Extra Kulfi', price: 70, available: true }, { name: 'Falooda', price: 30, available: true }],
  },
  {
    name: 'Gajar Ka Halwa',
    description: 'Slow-cooked grated carrot halwa with khoya, ghee and dry fruits. A soul-warming winter classic served warm.',
    price: 160,
    category: 'dessert',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1620230459399-2735b74c4c38?w=800&q=80',
    ingredients: ['Carrots', 'Khoya', 'Ghee', 'Sugar', 'Cardamom', 'Cashews', 'Raisins'],
    preparationTime: 10,
    addOns: [{ name: 'Extra Serving', price: 80, available: true }, { name: 'Vanilla Ice Cream', price: 60, available: true }],
  },

  // Drinks (4)
  {
    name: 'Mango Lassi',
    description: 'Thick and creamy blend of fresh yogurt with sweet Alphonso mango pulp. Chilled, refreshing and utterly tropical.',
    price: 130,
    category: 'beverages',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&q=80',
    ingredients: ['Yogurt', 'Mango Pulp', 'Milk', 'Sugar', 'Cardamom', 'Ice'],
    preparationTime: 5,
    addOns: [{ name: 'Extra Thick', price: 20, available: true }, { name: 'Large Size', price: 30, available: true }],
  },
  {
    name: 'Masala Chai',
    description: 'Aromatic Indian tea brewed with ginger, cardamom, cinnamon and cloves in full-cream milk. Perfect any time of day.',
    price: 60,
    category: 'beverages',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&q=80',
    ingredients: ['Tea Leaves', 'Milk', 'Ginger', 'Cardamom', 'Cinnamon', 'Cloves', 'Sugar'],
    preparationTime: 7,
    addOns: [{ name: 'Extra Strong', price: 10, available: true }, { name: 'Less Sugar', price: 0, available: true }],
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Freshly squeezed lime juice mixed with sparkling soda water. Your choice of sweet, salted or black salt. Instantly refreshing.',
    price: 80,
    category: 'beverages',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80',
    ingredients: ['Fresh Lime', 'Soda Water', 'Sugar/Salt', 'Black Salt', 'Ice', 'Mint'],
    preparationTime: 5,
    addOns: [{ name: 'Extra Lime', price: 10, available: true }, { name: 'Mint', price: 10, available: true }],
  },
  {
    name: 'Rose Sharbat',
    description: 'Chilled rose-flavored drink with basil seeds and milk. A classic Indian summer cooler, beautiful and fragrant.',
    price: 100,
    category: 'beverages',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
    ingredients: ['Rose Syrup', 'Milk', 'Basil Seeds', 'Ice', 'Sugar', 'Rose Petals'],
    preparationTime: 5,
    addOns: [{ name: 'Large Size', price: 30, available: true }, { name: 'Extra Basil Seeds', price: 10, available: true }],
  },
];

// ── 15 Non-Veg Items ──────────────────────────────────────────────────────────
const nonVegItems = [
  // Starters (4)
  {
    name: 'Chicken Tikka',
    description: 'Succulent boneless chicken marinated in spiced yogurt and grilled in a blazing tandoor. Charred, smoky and utterly irresistible.',
    price: 320,
    category: 'starter',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    ingredients: ['Chicken', 'Yogurt', 'Tandoori Spices', 'Lemon', 'Garlic', 'Ginger', 'Oil'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Chutney', price: 20, available: true }, { name: 'Extra Tikka (4 pcs)', price: 160, available: true }],
  },
  {
    name: 'Tandoori Prawns',
    description: 'Jumbo prawns marinated in saffron, carom seeds and tandoori masala, grilled to a beautiful char in the tandoor.',
    price: 480,
    category: 'starter',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=800&q=80',
    ingredients: ['Jumbo Prawns', 'Yogurt', 'Saffron', 'Carom Seeds', 'Tandoori Spices', 'Lemon', 'Butter'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Butter', price: 30, available: true }, { name: 'Extra Prawns (3)', price: 240, available: true }],
  },
  {
    name: 'Chicken Lollipop',
    description: 'Indo-Chinese style chicken winglets marinated in chilli sauce and deep-fried until crispy. Finger-licking good.',
    price: 340,
    category: 'starter',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
    ingredients: ['Chicken Wings', 'Red Chilli Sauce', 'Soy Sauce', 'Ginger', 'Garlic', 'Cornflour', 'Egg'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Sauce', price: 20, available: true }, { name: 'Extra Lollipops (3)', price: 170, available: true }],
  },
  {
    name: 'Mutton Seekh Kabab',
    description: 'Minced mutton with fresh herbs and spices pressed onto skewers and grilled on charcoal. Smoky, juicy and flavourful.',
    price: 400,
    category: 'starter',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1544025162-d76538b7a459?w=800&q=80',
    ingredients: ['Mutton Mince', 'Onion', 'Ginger', 'Garlic', 'Green Chilli', 'Coriander', 'Spices'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Raita', price: 25, available: true }, { name: 'Extra Skewer', price: 100, available: true }],
  },

  // Main Course (7)
  {
    name: 'Butter Chicken',
    description: 'Tender chicken in a velvety, mildly spiced tomato-cream sauce. The dish that made Indian cuisine world-famous.',
    price: 360,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    ingredients: ['Chicken', 'Tomato', 'Butter', 'Cream', 'Cashews', 'Spices', 'Fenugreek'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Chicken', price: 80, available: true }, { name: 'Extra Butter', price: 30, available: true }, { name: 'Naan', price: 40, available: true }],
  },
  {
    name: 'Chicken Biryani',
    description: 'Slow-cooked dum biryani with marinated chicken, fragrant saffron rice and caramelized onions. A complete meal in itself.',
    price: 380,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    ingredients: ['Basmati Rice', 'Chicken', 'Yogurt', 'Saffron', 'Fried Onions', 'Mint', 'Whole Spices'],
    preparationTime: 35,
    addOns: [{ name: 'Extra Chicken', price: 80, available: true }, { name: 'Raita', price: 30, available: true }, { name: 'Salan', price: 40, available: true }],
  },
  {
    name: 'Mutton Rogan Josh',
    description: 'Classic Kashmiri slow-braised mutton in a deep red sauce of dried Kashmiri chillies and aromatic whole spices.',
    price: 450,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800&q=80',
    ingredients: ['Mutton', 'Kashmiri Chilli', 'Yogurt', 'Onion', 'Whole Spices', 'Ginger', 'Garlic'],
    preparationTime: 40,
    addOns: [{ name: 'Extra Mutton', price: 100, available: true }, { name: 'Naan', price: 40, available: true }, { name: 'Rice', price: 25, available: true }],
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'Chargrilled chicken tikka simmered in a lush, creamy tomato masala. Smoky, rich and deeply satisfying.',
    price: 370,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    ingredients: ['Chicken Tikka', 'Tomato', 'Cream', 'Onion', 'Spices', 'Butter', 'Cashews'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Chicken', price: 80, available: true }, { name: 'Naan', price: 40, available: true }],
  },
  {
    name: 'Mutton Biryani',
    description: 'Slow-cooked dum biryani with tender mutton pieces and long-grain saffron rice. A feast fit for royalty.',
    price: 450,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
    ingredients: ['Basmati Rice', 'Mutton', 'Yogurt', 'Saffron', 'Fried Onions', 'Mint', 'Whole Spices'],
    preparationTime: 45,
    addOns: [{ name: 'Extra Mutton', price: 100, available: true }, { name: 'Raita', price: 30, available: true }],
  },
  {
    name: 'Prawn Masala',
    description: 'Succulent prawns cooked in a fiery, tangy coastal masala with kokum and coconut. Pairs beautifully with steamed rice.',
    price: 520,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=800&q=80',
    ingredients: ['Prawns', 'Coconut', 'Kokum', 'Tomato', 'Onion', 'Curry Leaves', 'Mustard Seeds'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Prawns', price: 130, available: true }, { name: 'Steamed Rice', price: 25, available: true }],
  },
  {
    name: 'Fish Curry',
    description: 'Fresh river fish cooked in a tangy, aromatic mustard-turmeric gravy. A Bengali-style comfort dish with steamed rice.',
    price: 390,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    ingredients: ['Fresh Fish', 'Mustard Paste', 'Turmeric', 'Green Chilli', 'Mustard Oil', 'Tomato', 'Coriander'],
    preparationTime: 25,
    addOns: [{ name: 'Extra Fish', price: 90, available: true }, { name: 'Steamed Rice', price: 25, available: true }],
  },

  // Dessert & Beverages (4)
  {
    name: 'Egg Biryani',
    description: 'Fragrant basmati rice layered with spiced boiled eggs and caramelized onions. A simpler yet no less delicious biryani.',
    price: 260,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    ingredients: ['Basmati Rice', 'Eggs', 'Fried Onions', 'Yogurt', 'Mint', 'Saffron', 'Whole Spices'],
    preparationTime: 30,
    addOns: [{ name: 'Extra Egg', price: 30, available: true }, { name: 'Raita', price: 30, available: true }],
  },
  {
    name: 'Chicken Keema Pav',
    description: 'Spicy minced chicken cooked with peas and tomatoes, served with soft buttered pav. A Mumbai street-food icon.',
    price: 220,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    ingredients: ['Chicken Mince', 'Green Peas', 'Onion', 'Tomato', 'Spices', 'Ginger', 'Garlic'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Pav (2)', price: 20, available: true }, { name: 'Extra Butter', price: 20, available: true }],
  },
  {
    name: 'Chicken Soup',
    description: 'Clear, nourishing broth with shredded chicken, vegetables and fresh herbs. A warming bowl of comfort.',
    price: 180,
    category: 'soup',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    ingredients: ['Chicken', 'Carrot', 'Celery', 'Onion', 'Ginger', 'Garlic', 'Fresh Herbs'],
    preparationTime: 20,
    addOns: [{ name: 'Extra Chicken', price: 60, available: true }, { name: 'Bread Stick', price: 30, available: true }],
  },
  {
    name: 'Boneless Chicken Handi',
    description: 'Slow-cooked boneless chicken in a clay pot (handi) with whole spices, cream and a signature smoky finish.',
    price: 380,
    category: 'main',
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80',
    ingredients: ['Boneless Chicken', 'Cream', 'Yogurt', 'Onion', 'Tomato', 'Whole Spices', 'Ghee'],
    preparationTime: 30,
    addOns: [{ name: 'Extra Chicken', price: 80, available: true }, { name: 'Naan', price: 40, available: true }],
  },
];

async function seedMenu() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const { Restaurant } = await import('../models/Restaurant.model.js');
  const { Menu } = await import('../models/Menu.model.js');

  const restaurant = await Restaurant.findOne({ slug: RESTAURANT_SLUG });
  if (!restaurant) {
    console.error(`❌ Restaurant with slug "${RESTAURANT_SLUG}" not found.`);
    console.error('   Set SEED_RESTAURANT_SLUG env var or ensure the restaurant exists.');
    process.exit(1);
  }

  console.log(`🍽️  Restaurant: ${restaurant.name} (${restaurant._id})\n`);

  const allItems = [...vegItems, ...nonVegItems];
  let added = 0;
  let skipped = 0;

  for (const item of allItems) {
    const existing = await Menu.findOne({ restaurantId: restaurant._id, name: item.name });
    if (existing) {
      console.log(`  ⏭️  Skipped: ${item.name}`);
      skipped++;
      continue;
    }
    await Menu.create({ ...item, restaurantId: restaurant._id, available: true });
    const type = item.isVeg ? '🟢 VEG' : '🔴 NON-VEG';
    console.log(`  ✅ ${type}  ${item.name.padEnd(30)} ₹${item.price}`);
    added++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Added   : ${added} items`);
  console.log(`⏭️  Skipped : ${skipped} items (already existed)`);

  const vegCount = await Menu.countDocuments({ restaurantId: restaurant._id, isVeg: true });
  const nonVegCount = await Menu.countDocuments({ restaurantId: restaurant._id, isVeg: false });
  console.log(`\n📊 Total in DB → 🟢 Veg: ${vegCount}  |  🔴 Non-Veg: ${nonVegCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
}

seedMenu().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

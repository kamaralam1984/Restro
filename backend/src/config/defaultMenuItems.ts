import { IAddOn } from '../models/Menu.model';

export interface DefaultMenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  image?: string;
  ingredients?: string[];
  preparationTime?: number;
  addOns?: IAddOn[];
}

// A curated set of signature items used as default menu
// for new restaurants. These mirror the items seeded for
// the demo restaurant, with images and pricing.
export const DEFAULT_MENU_ITEMS: DefaultMenuItem[] = [
  {
    name: 'Paneer Tikka',
    description:
      'Juicy cottage cheese cubes marinated in spiced yogurt, grilled to perfection in a tandoor. Served with mint chutney.',
    price: 280,
    category: 'starter',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    ingredients: ['Paneer', 'Yogurt', 'Bell Peppers', 'Onion', 'Tandoori Spices', 'Lemon'],
    preparationTime: 20,
    addOns: [
      { name: 'Extra Chutney', price: 20, available: true },
      { name: 'Extra Paneer', price: 60, available: true },
    ],
  },
  {
    name: 'Veg Spring Rolls',
    description:
      'Crispy golden spring rolls stuffed with stir-fried vegetables and glass noodles. Served with sweet chilli sauce.',
    price: 180,
    category: 'starter',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1548507835-dcba9efa0c21?w=800&q=80',
    ingredients: ['Cabbage', 'Carrot', 'Glass Noodles', 'Spring Onion', 'Soy Sauce', 'Ginger'],
    preparationTime: 15,
    addOns: [
      { name: 'Extra Sauce', price: 20, available: true },
      { name: 'Extra Rolls (2)', price: 90, available: true },
    ],
  },
  {
    name: 'Paneer Butter Masala',
    description:
      'Rich and creamy curry with soft paneer cubes in a luscious tomato-butter gravy. Best enjoyed with naan or rice.',
    price: 320,
    category: 'main',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    ingredients: ['Paneer', 'Tomato', 'Butter', 'Cream', 'Cashews', 'Spices', 'Onion'],
    preparationTime: 20,
    addOns: [
      { name: 'Extra Paneer', price: 60, available: true },
      { name: 'Extra Butter', price: 30, available: true },
      { name: 'Naan', price: 40, available: true },
    ],
  },
  {
    name: 'Veg Biryani',
    description:
      'Fragrant basmati rice layered with spiced vegetables, caramelized onions, and saffron. Served with raita and mirch ka salan.',
    price: 280,
    category: 'main',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    ingredients: [
      'Basmati Rice',
      'Mixed Vegetables',
      'Saffron',
      'Caramelized Onion',
      'Mint',
      'Yogurt',
      'Spices',
    ],
    preparationTime: 30,
    addOns: [
      { name: 'Extra Raita', price: 30, available: true },
      { name: 'Extra Salan', price: 40, available: true },
    ],
  },
  {
    name: 'Butter Naan',
    description:
      'Soft, pillowy leavened bread baked fresh in a tandoor and brushed generously with butter. Perfect with any curry.',
    price: 50,
    category: 'bread',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    ingredients: ['Flour', 'Yeast', 'Butter', 'Milk', 'Salt'],
    preparationTime: 10,
    addOns: [
      { name: 'Extra Butter', price: 20, available: true },
      { name: 'Garlic', price: 15, available: true },
    ],
  },
  {
    name: 'Jeera Rice',
    description:
      'Fragrant basmati rice tempered with cumin seeds, ghee and fresh coriander. A simple yet elegant accompaniment.',
    price: 120,
    category: 'rice',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
    ingredients: ['Basmati Rice', 'Cumin Seeds', 'Ghee', 'Coriander', 'Salt'],
    preparationTime: 15,
    addOns: [
      { name: 'Extra Rice', price: 60, available: true },
      { name: 'Extra Ghee', price: 25, available: true },
    ],
  },
  {
    name: 'Garlic Naan',
    description:
      'Tandoor-baked naan topped with freshly minced garlic, coriander and butter. Aromatic and irresistible.',
    price: 60,
    category: 'bread',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80',
    ingredients: ['Flour', 'Garlic', 'Butter', 'Coriander', 'Yeast', 'Salt'],
    preparationTime: 10,
    addOns: [{ name: 'Extra Garlic Butter', price: 20, available: true }],
  },
  {
    name: 'Gulab Jamun',
    description:
      "Melt-in-your-mouth milk-solid dumplings soaked in rose-cardamom sugar syrup. India's most beloved dessert.",
    price: 120,
    category: 'dessert',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
    ingredients: ['Milk Powder', 'Khoya', 'Sugar', 'Rose Water', 'Cardamom', 'Saffron'],
    preparationTime: 15,
    addOns: [
      { name: 'Extra Gulab Jamun', price: 60, available: true },
      { name: 'Vanilla Ice Cream', price: 60, available: true },
    ],
  },
  {
    name: 'Masala Chai',
    description:
      'Strong Indian tea simmered with milk, sugar and a house blend of warming spices. Perfect end to any meal.',
    price: 60,
    category: 'beverage',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
    ingredients: ['Tea', 'Milk', 'Sugar', 'Cardamom', 'Ginger', 'Cinnamon'],
    preparationTime: 8,
  },
  {
    name: 'Cold Coffee Frappe',
    description:
      'Chilled blended coffee with milk, ice and chocolate drizzle. Creamy, refreshing and perfect for summers.',
    price: 180,
    category: 'beverage',
    isVeg: true,
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    ingredients: ['Coffee', 'Milk', 'Ice', 'Sugar', 'Chocolate Syrup'],
    preparationTime: 7,
  },
];


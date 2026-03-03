import mongoose from 'mongoose';
import { Menu } from '../models/Menu.model';
import { DEFAULT_MENU_ITEMS } from '../config/defaultMenuItems';

export const seedDefaultMenuForRestaurant = async (
  restaurantId: mongoose.Types.ObjectId
): Promise<void> => {
  // Avoid duplicates: only seed when restaurant has no items
  const existingCount = await Menu.countDocuments({
    restaurantId,
    isDeleted: { $ne: true },
  });
  if (existingCount > 0) return;

  const docs = DEFAULT_MENU_ITEMS.map((item) => ({
    ...item,
    restaurantId,
  }));

  await Menu.insertMany(docs);
};


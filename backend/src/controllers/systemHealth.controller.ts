import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.model';
import { Menu } from '../models/Menu.model';
import { Table } from '../models/Table.model';
import { HeroImage } from '../models/HeroImage.model';
import { seedDefaultMenuForRestaurant } from '../services/defaultMenu.service';
import { createDefaultTablesForRestaurant } from './table.controller';

interface ScanResult {
  restaurantId: string;
  name: string;
  slug: string;
  menuCount: number;
  tableCount: number;
  heroImageCount: number;
  fixedMenu: boolean;
  fixedTables: boolean;
  fixedHeroImages: boolean;
}

/**
 * Super Admin: scan all restaurants for missing critical data (menu, tables, hero images)
 * and optionally auto-repair by re-seeding defaults.
 *
 * This does NOT delete anything; it only adds missing defaults.
 */
export const scanAndRepairSystem = async (req: Request, res: Response) => {
  try {
    const { repair } = req.body as { repair?: boolean };

    const restaurants = await Restaurant.find({})
      .select('_id name slug')
      .lean();

    const results: ScanResult[] = [];

    for (const rest of restaurants) {
      const restaurantId = rest._id as mongoose.Types.ObjectId;

      const [menuCount, tableCount, heroImageCount] = await Promise.all([
        Menu.countDocuments({ restaurantId, isDeleted: { $ne: true } }),
        Table.countDocuments({ restaurantId }),
        HeroImage.countDocuments({ restaurantId }),
      ]);

      let fixedMenu = false;
      let fixedTables = false;
      let fixedHeroImages = false;

      if (repair) {
        if (menuCount === 0) {
          await seedDefaultMenuForRestaurant(restaurantId);
          fixedMenu = true;
        }
        if (tableCount === 0) {
          await createDefaultTablesForRestaurant(restaurantId);
          fixedTables = true;
        }
        // For hero images we only log; re-use initialize script manually if needed
        if (heroImageCount === 0) {
          fixedHeroImages = false;
        }
      }

      results.push({
        restaurantId: String(restaurantId),
        name: rest.name,
        slug: rest.slug,
        menuCount,
        tableCount,
        heroImageCount,
        fixedMenu,
        fixedTables,
        fixedHeroImages,
      });
    }

    res.json({
      repairApplied: !!repair,
      totalRestaurants: restaurants.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scan/repair failed' });
  }
};


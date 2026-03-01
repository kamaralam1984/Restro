import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Menu } from '../models/Menu.model';
import { Restaurant } from '../models/Restaurant.model';
import { createAuditLog } from '../utils/auditLog';
import { cacheGet, cacheSet, cacheDel, cacheKeyMenuByRestaurant } from '../utils/cache';
import { CACHE_TTL } from '../config/redis';

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const {
      category,
      available,
      isVeg,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '50',
      restaurant: restaurantSlug,
    } = req.query;

    // Build filter object (soft delete: exclude deleted items)
    const filter: any = { isDeleted: { $ne: true } };

    // Filter by restaurant when slug is provided (for /r/[slug] storefront)
    let rest: { _id: mongoose.Types.ObjectId } | null = null;
    if (restaurantSlug && typeof restaurantSlug === 'string') {
      rest = await Restaurant.findOne({ slug: restaurantSlug.trim(), status: 'active' }).select('_id').lean();
      if (rest) filter.restaurantId = rest._id;
    }

    // Cache only for simple public menu list: by slug, default availability, no search/filters
    const simpleList =
      rest &&
      !category &&
      available !== 'all' &&
      (available === undefined || available === 'true') &&
      !isVeg &&
      !search &&
      !minPrice &&
      !maxPrice &&
      String(sortBy) === 'createdAt' &&
      String(sortOrder) === 'desc' &&
      String(page) === '1' &&
      String(limit) === '50';
    if (simpleList && rest) {
      const cacheKey = cacheKeyMenuByRestaurant(String(rest._id));
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Availability filter
    // If 'all' is passed, show all items (for admin panel)
    // If 'true' or 'false' is passed, filter accordingly
    // If undefined, default to only available items (for customer-facing pages)
    if (available !== undefined) {
      if (available === 'all') {
        // Don't filter by availability - show all items
      } else {
        filter.available = available === 'true';
      }
    } else {
      filter.available = true; // Default: show only available items
    }

    // Veg/Non-Veg filter
    if (isVeg !== undefined && isVeg !== 'all') {
      filter.isVeg = isVeg === 'true' || isVeg === 'veg';
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Search filter (name or description)
    const searchStr = typeof search === 'string' ? search : (Array.isArray(search) ? search[0] : '');
    if (searchStr) {
      const searchRegex = new RegExp(String(searchStr), 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { ingredients: { $in: [searchRegex] } },
      ];
    }

    // Sorting
    const sortOptions: Record<string, 1 | -1> = {};
    const validSortFields = ['name', 'price', 'createdAt', 'category', 'preparationTime'];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [menuItems, totalCount] = await Promise.all([
      Menu.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Menu.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const payload = {
      items: menuItems,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        category: category || 'all',
        isVeg: isVeg || 'all',
        available: filter.available,
        search: search || '',
        priceRange: {
          min: minPrice ? Number(minPrice) : null,
          max: maxPrice ? Number(maxPrice) : null,
        },
      },
    };
    if (simpleList && rest) {
      await cacheSet(cacheKeyMenuByRestaurant(String(rest._id)), JSON.stringify(payload), CACHE_TTL.MENU_SEC);
    }
    res.json(payload);
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch menu items' });
  }
};

export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = new Menu(req.body);
    await menuItem.save();
    if (menuItem.restaurantId) {
      await cacheDel(cacheKeyMenuByRestaurant(String(menuItem.restaurantId)));
    }
    res.status(201).json(menuItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create menu item' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const oldItem = await Menu.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
    const menuItem = await Menu.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const user = (req as any).user;
    if (user?.userId) {
      await createAuditLog({
        userId: new mongoose.Types.ObjectId(user.userId),
        userEmail: user.email || 'unknown',
        userRole: user.role || 'admin',
        restaurantId: user.restaurantId ? new mongoose.Types.ObjectId(user.restaurantId) : undefined,
        action: 'menu.edit',
        entityType: 'Menu',
        entityId: menuItem._id,
        oldValue: oldItem ? { name: oldItem.name, price: oldItem.price } : undefined,
        newValue: { name: menuItem.name, price: menuItem.price },
      });
    }
    if (menuItem.restaurantId) {
      await cacheDel(cacheKeyMenuByRestaurant(String(menuItem.restaurantId)));
    }
    res.json(menuItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const user = (req as any).user;
    if (user?.userId) {
      await createAuditLog({
        userId: new mongoose.Types.ObjectId(user.userId),
        userEmail: user.email || 'unknown',
        userRole: user.role || 'admin',
        restaurantId: user.restaurantId ? new mongoose.Types.ObjectId(user.restaurantId) : undefined,
        action: 'menu.delete',
        entityType: 'Menu',
        entityId: menuItem._id,
        oldValue: { name: menuItem.name },
      });
    }
    if (menuItem.restaurantId) {
      await cacheDel(cacheKeyMenuByRestaurant(String(menuItem.restaurantId)));
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const filter: any = { available: true };
    const restaurantSlug = req.query.restaurant;
    if (restaurantSlug && typeof restaurantSlug === 'string') {
      const rest = await Restaurant.findOne({ slug: restaurantSlug.trim(), status: 'active' }).select('_id').lean();
      if (rest) filter.restaurantId = new mongoose.Types.ObjectId(rest._id);
    }
    const categories = await Menu.distinct('category', filter);
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Menu.countDocuments({ ...filter, category });
        return { name: category, count };
      })
    );
    res.json(categoriesWithCount);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch categories' });
  }
};

// Get price range for filtering
export const getPriceRange = async (req: Request, res: Response) => {
  try {
    const filter: any = { available: true };
    const restaurantSlug = req.query.restaurant;
    if (restaurantSlug && typeof restaurantSlug === 'string') {
      const rest = await Restaurant.findOne({ slug: restaurantSlug.trim(), status: 'active' }).select('_id').lean();
      if (rest) filter.restaurantId = new mongoose.Types.ObjectId(rest._id);
    }
    const [minPriceResult, maxPriceResult] = await Promise.all([
      Menu.findOne(filter).sort({ price: 1 }).select('price').lean(),
      Menu.findOne(filter).sort({ price: -1 }).select('price').lean(),
    ]);
    res.json({
      min: minPriceResult?.price || 0,
      max: maxPriceResult?.price || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch price range' });
  }
};


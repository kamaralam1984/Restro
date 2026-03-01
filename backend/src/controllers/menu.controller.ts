import { Request, Response } from 'express';
import { Menu } from '../models/Menu.model';

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
    } = req.query;

    // Build filter object
    const filter: any = {};

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
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Sorting
    const sortOptions: any = {};
    const validSortFields = ['name', 'price', 'createdAt', 'category', 'preparationTime'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
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

    res.json({
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
    });
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch menu items' });
  }
};

export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findById(id);

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
    res.status(201).json(menuItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create menu item' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findByIdAndDelete(id);

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Menu.distinct('category');
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Menu.countDocuments({ category, available: true });
        return {
          name: category,
          count,
        };
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
    const [minPriceResult, maxPriceResult] = await Promise.all([
      Menu.findOne({ available: true }).sort({ price: 1 }).select('price').lean(),
      Menu.findOne({ available: true }).sort({ price: -1 }).select('price').lean(),
    ]);

    res.json({
      min: minPriceResult?.price || 0,
      max: maxPriceResult?.price || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch price range' });
  }
};


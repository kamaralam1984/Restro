import { Request, Response } from 'express';
import { HeroImage } from '../models/HeroImage.model';
import { Restaurant } from '../models/Restaurant.model';

// Get hero images (public). Optional ?restaurant=slug to filter by restaurant.
export const getHeroImages = async (req: Request, res: Response) => {
  try {
    const slug = typeof req.query.restaurant === 'string' ? req.query.restaurant.trim() : null;
    const filter: Record<string, unknown> = { isActive: true };
    if (slug) {
      const rest = await Restaurant.findOne({ slug }).select('_id').lean();
      if (rest) filter.restaurantId = rest._id;
    }
    const images = await HeroImage.find(filter)
      .sort({ order: 1 })
      .select('-__v');
    res.json(images);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch hero images' });
  }
};

// Get all hero images (admin). Rental admin: only their restaurant. Super admin: all.
export const getAllHeroImages = async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user?.restaurantId;
    const filter = restaurantId ? { restaurantId } : {};
    const images = await HeroImage.find(filter)
      .sort({ order: 1 })
      .select('-__v');
    res.json(images);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch hero images' });
  }
};

// Create or update hero image. Rental admin: scoped to their restaurant.
export const upsertHeroImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl, order, isActive } = req.body;
    const restaurantId = (req as any).user?.restaurantId;

    if (!imageUrl || !order) {
      return res.status(400).json({ error: 'Image URL and order are required' });
    }
    if (order < 1 || order > 5) {
      return res.status(400).json({ error: 'Order must be between 1 and 5' });
    }
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required to manage hero images' });
    }

    const existingImage = await HeroImage.findOne({ restaurantId, order });

    if (existingImage) {
      existingImage.imageUrl = imageUrl;
      existingImage.isActive = isActive !== undefined ? isActive : existingImage.isActive;
      await existingImage.save();
      res.json(existingImage);
    } else {
      const newImage = new HeroImage({
        restaurantId,
        imageUrl,
        order,
        isActive: isActive !== undefined ? isActive : true,
      });
      await newImage.save();
      res.status(201).json(newImage);
    }
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'An image with this order already exists' });
    }
    res.status(500).json({ error: error.message || 'Failed to save hero image' });
  }
};

// Delete hero image. Rental admin: only their restaurant's images.
export const deleteHeroImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = (req as any).user?.restaurantId;
    const filter: Record<string, unknown> = { _id: id };
    if (restaurantId) filter.restaurantId = restaurantId;
    const image = await HeroImage.findOneAndDelete(filter);
    if (!image) {
      return res.status(404).json({ error: 'Hero image not found' });
    }
    res.json({ message: 'Hero image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete hero image' });
  }
};

// Update hero image order. Rental admin: only their restaurant's images.
export const updateHeroImageOrder = async (req: Request, res: Response) => {
  try {
    const { images } = req.body;
    const restaurantId = (req as any).user?.restaurantId;
    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }
    const filter = restaurantId ? { restaurantId } : {};
    for (const img of images as { id: string; order: number }[]) {
      await HeroImage.findOneAndUpdate(
        { _id: img.id, ...filter },
        { order: img.order }
      );
    }
    const updatedImages = await HeroImage.find(filter).sort({ order: 1 });
    res.json(updatedImages);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update hero image order' });
  }
};


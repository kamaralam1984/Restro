import { Request, Response } from 'express';
import { HeroImage } from '../models/HeroImage.model';

// Get all hero images (public endpoint)
export const getHeroImages = async (req: Request, res: Response) => {
  try {
    const images = await HeroImage.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');
    
    res.json(images);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch hero images' });
  }
};

// Get all hero images (admin - includes inactive)
export const getAllHeroImages = async (req: Request, res: Response) => {
  try {
    const images = await HeroImage.find()
      .sort({ order: 1 })
      .select('-__v');
    
    res.json(images);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch hero images' });
  }
};

// Create or update hero image
export const upsertHeroImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl, order, isActive } = req.body;

    if (!imageUrl || !order) {
      return res.status(400).json({ error: 'Image URL and order are required' });
    }

    if (order < 1 || order > 5) {
      return res.status(400).json({ error: 'Order must be between 1 and 5' });
    }

    // Check if image with this order exists
    const existingImage = await HeroImage.findOne({ order });

    if (existingImage) {
      // Update existing
      existingImage.imageUrl = imageUrl;
      existingImage.isActive = isActive !== undefined ? isActive : existingImage.isActive;
      await existingImage.save();
      res.json(existingImage);
    } else {
      // Create new
      const newImage = new HeroImage({
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

// Delete hero image
export const deleteHeroImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = await HeroImage.findByIdAndDelete(id);
    
    if (!image) {
      return res.status(404).json({ error: 'Hero image not found' });
    }
    
    res.json({ message: 'Hero image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete hero image' });
  }
};

// Update hero image order
export const updateHeroImageOrder = async (req: Request, res: Response) => {
  try {
    const { images } = req.body; // Array of { id, order }

    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    // Update all images
    const updatePromises = images.map((img: { id: string; order: number }) =>
      HeroImage.findByIdAndUpdate(img.id, { order: img.order }, { new: true })
    );

    await Promise.all(updatePromises);
    
    const updatedImages = await HeroImage.find().sort({ order: 1 });
    res.json(updatedImages);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update hero image order' });
  }
};


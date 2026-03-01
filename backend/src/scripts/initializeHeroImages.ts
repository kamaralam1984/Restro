import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { HeroImage } from '../models/HeroImage.model';
import { connectDB } from '../config/db';

dotenv.config();

// 5 default hero images with different food styles
const defaultHeroImages = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
    order: 1,
    isActive: true,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80',
    order: 2,
    isActive: true,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    order: 3,
    isActive: true,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
    order: 4,
    isActive: true,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
    order: 5,
    isActive: true,
  },
];

async function initializeHeroImages() {
  try {
    await connectDB();
    console.log('📦 Connected to database\n');

    const existingImages = await HeroImage.countDocuments();
    if (existingImages >= 5) {
      console.log(`✅ Hero images already exist (${existingImages} images found)`);
      console.log('💡 To reset, delete existing images from admin panel first\n');
      process.exit(0);
    }

    console.log('🔄 Initializing 5 default hero images...\n');

    for (const imageData of defaultHeroImages) {
      // Check if image with this order already exists
      const existing = await HeroImage.findOne({ order: imageData.order });
      
      if (existing) {
        console.log(`⏭️  Skipped order ${imageData.order} (already exists)`);
        continue;
      }

      const heroImage = new HeroImage(imageData);
      await heroImage.save();
      console.log(`✅ Created hero image #${imageData.order}`);
    }

    const totalImages = await HeroImage.countDocuments();
    console.log(`\n✅ Successfully initialized ${totalImages} hero images!`);
    console.log('💡 You can manage these images from the admin panel: /admin/hero-images\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error initializing hero images:', error);
    process.exit(1);
  }
}

initializeHeroImages();


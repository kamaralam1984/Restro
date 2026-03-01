import { Request, Response } from 'express';
import path from 'path';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file path relative to the public directory
    // In production, you might want to upload to cloud storage (S3, Cloudinary, etc.)
    const fileUrl = `/uploads/menu/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: fileUrl,
      filename: req.file.filename,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
};


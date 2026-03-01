import { Request, Response } from 'express';
import { Review } from '../models/Review.model';

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { rating, verified } = req.query;
    const filter: any = {};

    if (rating) {
      filter.rating = parseInt(rating as string);
    }

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const reviews = await Review.find(filter)
      .populate('menuItemId', 'name')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

export const getReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id)
      .populate('menuItemId', 'name')
      .populate('orderId', 'orderNumber');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create review' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};


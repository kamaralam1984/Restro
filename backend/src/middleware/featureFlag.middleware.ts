import { Request, Response, NextFunction } from 'express';
import { Restaurant } from '../models/Restaurant.model';

type FeatureKey = 'tableBooking' | 'billing' | 'analytics' | 'staffControl';

/** Require the given feature to be enabled for the current restaurant. Skips check for super_admin. */
export const requireFeature = (feature: FeatureKey) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Authentication required' });
      if (user.role === 'super_admin') return next();

      const restaurantId = user.restaurantId;
      if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });

      const restaurant = await Restaurant.findById(restaurantId).select('features').lean();
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

      const features = restaurant.features as Record<string, boolean> | undefined;
      const enabled = features?.[feature] !== false;
      if (!enabled) {
        return res.status(403).json({
          error: `This feature (${feature}) is disabled for your restaurant. Contact your platform admin.`,
        });
      }
      next();
    } catch (err: any) {
      next(err);
    }
  };
};

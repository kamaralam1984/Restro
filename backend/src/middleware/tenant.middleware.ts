import { Request, Response, NextFunction } from 'express';
import { Restaurant, IRestaurant } from '../models/Restaurant.model';

declare global {
  namespace Express {
    interface Request {
      restaurant?: IRestaurant;
      restaurantId?: string;
    }
  }
}

/**
 * Resolves the current tenant (restaurant) from the request.
 * Resolution order:
 *   1. x-restaurant-slug header  (preferred for API clients)
 *   2. x-restaurant-id header    (direct ObjectId)
 *   3. :restaurantSlug route param
 *
 * Attaches req.restaurant and req.restaurantId for downstream use.
 */
export const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug =
      (req.headers['x-restaurant-slug'] as string) ||
      (req.params.restaurantSlug as string);

    const id = req.headers['x-restaurant-id'] as string;

    let restaurant: IRestaurant | null = null;

    if (slug) {
      restaurant = await Restaurant.findOne({ slug, status: 'active' }).lean() as IRestaurant | null;
    } else if (id) {
      restaurant = await Restaurant.findOne({ _id: id, status: 'active' }).lean() as IRestaurant | null;
    }

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found or inactive' });
    }

    // Check subscription
    if (restaurant.subscriptionStatus === 'suspended' || restaurant.subscriptionStatus === 'cancelled') {
      return res.status(403).json({
        error: 'Restaurant subscription is suspended. Please contact support.',
      });
    }

    req.restaurant = restaurant;
    req.restaurantId = (restaurant as any)._id.toString();
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional tenant resolution — does not fail if restaurant header is missing.
 * Useful for routes that work both with and without tenant context.
 */
export const resolveTenantOptional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.headers['x-restaurant-slug'] as string;
    const id = req.headers['x-restaurant-id'] as string;

    if (slug || id) {
      const query = slug
        ? { slug, status: 'active' }
        : { _id: id, status: 'active' };

      const restaurant = await Restaurant.findOne(query).lean() as IRestaurant | null;
      if (restaurant) {
        req.restaurant = restaurant;
        req.restaurantId = (restaurant as any)._id.toString();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

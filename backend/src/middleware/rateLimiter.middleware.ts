import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const rateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, message = 'Too many requests, please try again later.', skipSuccessfulRequests = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    // Get or create rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    next();
  };
};

// Pre-configured rate limiters
export const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes (increased for development)
});

export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes (increased for development)
  message: 'Too many authentication attempts, please try again later.',
});

export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute (increased for development)
});

// Per-tenant rate limiter: key by restaurantId (from auth) or IP when unauthenticated
export const tenantApiRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req as any).user?.restaurantId ?? req.headers['x-tenant-id'];
  const key = tenantId ? `tenant:${tenantId}` : `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  return rateLimiter({
    windowMs: 60 * 1000,
    max: 300,
    message: 'Too many requests for this tenant, please try again later.',
  })({ ...req, ip: key } as any, res, next);
};


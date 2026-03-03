import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ErrorLog } from '../models/ErrorLog.model';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = async (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(message, { statusCode, stack: err.stack });

  // Persist error for super admin bug control panel (best-effort, non-blocking)
  try {
    const userId = (req as any).user?.userId || null;
    const restaurantId = (req as any).user?.restaurantId || null;
    await ErrorLog.create({
      level: 'error',
      message,
      statusCode,
      route: req.originalUrl,
      method: req.method,
      userId,
      restaurantId,
      stack: err.stack,
      meta: {},
    });
  } catch (e) {
    logger.error('Failed to persist error log', { error: (e as any)?.message });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Route not found' });
};

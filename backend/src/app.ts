import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import analyticsRoutes from './routes/analytics.routes';
import authRoutes from './routes/auth.routes';
import reviewRoutes from './routes/review.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';
import billingRoutes from './routes/billing.routes';
import tableRoutes from './routes/table.routes';
import revenueRoutes from './routes/revenue.routes';
import heroImageRoutes from './routes/heroImage.routes';
import superAdminRoutes from './routes/superAdmin.routes';
import restaurantRoutes from './routes/restaurant.routes';
import v1Routes from './routes/v1.index';
import { errorHandler, notFound } from './middleware/error.middleware';
import { generalRateLimiter, apiRateLimiter } from './middleware/rateLimiter.middleware';

dotenv.config();

const app = express();

const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// HTTP request logging: combined in production, dev format otherwise
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS: in production restrict to allowed origins; in dev allow all
app.use(cors({
  origin: NODE_ENV === 'production' && CORS_ORIGIN
    ? CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : true,
  credentials: true,
}));

// NoSQL injection sanitization (strip $ and . from user input)
app.use(mongoSanitize());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limiting (exclude health check from rate limiting)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next(); // Skip rate limiting for health check
  }
  return generalRateLimiter(req, res, next);
});
app.use('/api/orders', apiRateLimiter);
app.use('/api/bookings', apiRateLimiter);

// Health check (liveness) — includes DB so frontend can show DB Online/Offline
app.get('/api/health', (_req, res) => {
  const dbReadyState = mongoose.connection.readyState;
  const dbConnected = dbReadyState === 1;
  res.json({
    status: 'ok',
    message: 'Backend API is running',
    timestamp: new Date().toISOString(),
    database: { connected: dbConnected },
  });
});

// Readiness (DB + critical deps) — for k8s/load balancers
app.get('/api/ready', async (_req, res) => {
  const dbReadyState = mongoose.connection.readyState;
  const dbOk = dbReadyState === 1;
  const dbName = mongoose.connection.db?.databaseName || 'unknown';

  if (!dbOk) {
    return res.status(503).json({
      status: 'not ready',
      database: { status: 'disconnected', readyState: dbReadyState, databaseName: dbName },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    status: 'ready',
    database: { status: 'connected', databaseName: dbName },
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/hero-images', heroImageRoutes);

// Multi-tenant routes
app.use('/api/super-admin', superAdminRoutes);   // Super admin panel
app.use('/api/restaurants', restaurantRoutes);   // Restaurant info + admin settings

// API versioning: /api/v1/* (same routes as /api/* for backward compatibility)
app.use('/api/v1', v1Routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;


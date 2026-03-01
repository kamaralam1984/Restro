import express from 'express';
import cors from 'cors';
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
import { errorHandler, notFound } from './middleware/error.middleware';
import { generalRateLimiter, apiRateLimiter } from './middleware/rateLimiter.middleware';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
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

// Health check
app.get('/api/health', async (req, res) => {
  const dbReadyState = mongoose.connection.readyState;
  const dbStatus = dbReadyState === 1 ? 'connected' : 'disconnected';
  const dbName = mongoose.connection.db?.databaseName || 'unknown';
  
  res.json({ 
    status: 'ok', 
    message: 'Backend API is running',
    database: {
      status: dbStatus,
      connected: dbStatus === 'connected',
      readyState: dbReadyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      databaseName: dbName
    },
    timestamp: new Date().toISOString()
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

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;


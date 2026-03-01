import { Router } from 'express';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import analyticsRoutes from './analytics.routes';
import authRoutes from './auth.routes';
import reviewRoutes from './review.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import billingRoutes from './billing.routes';
import tableRoutes from './table.routes';
import revenueRoutes from './revenue.routes';
import heroImageRoutes from './heroImage.routes';
import superAdminRoutes from './superAdmin.routes';
import restaurantRoutes from './restaurant.routes';

const v1 = Router();

v1.use('/menu', menuRoutes);
v1.use('/orders', orderRoutes);
v1.use('/bookings', bookingRoutes);
v1.use('/payments', paymentRoutes);
v1.use('/analytics', analyticsRoutes);
v1.use('/auth', authRoutes);
v1.use('/reviews', reviewRoutes);
v1.use('/users', userRoutes);
v1.use('/upload', uploadRoutes);
v1.use('/billing', billingRoutes);
v1.use('/tables', tableRoutes);
v1.use('/revenue', revenueRoutes);
v1.use('/hero-images', heroImageRoutes);
v1.use('/super-admin', superAdminRoutes);
v1.use('/restaurants', restaurantRoutes);

export default v1;

import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { Order } from '../models/Order.model';
import { Booking } from '../models/Booking.model';
import { User } from '../models/User.model';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Today's revenue
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    // Pending orders
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed'] },
    });

    // Online vs COD
    const paymentMethodStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
        },
      },
    ]);

    const onlineCount = paymentMethodStats.find((p) => p._id === 'online')?.count || 0;
    const codCount = paymentMethodStats.find((p) => p._id === 'cash')?.count || 0;
    const totalPaid = onlineCount + codCount;
    const onlinePercentage = totalPaid > 0 ? Math.round((onlineCount / totalPaid) * 100) : 0;

    res.json({
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      pendingOrders,
      onlineVsCOD: {
        online: onlineCount,
        cod: codCount,
        onlinePercentage,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch dashboard stats' });
  }
};

export const getOrdersPerHour = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: targetDate, $lt: nextDay },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill in missing hours with 0
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourData = orders.find((o) => o._id === hour);
      return {
        hour,
        orders: hourData?.count || 0,
        revenue: hourData?.revenue || 0,
      };
    });

    res.json(hourlyData);
  } catch (error: any) {
    console.error('Error fetching orders per hour:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch orders per hour' });
  }
};

export const getTopSellingItems = async (req: Request, res: Response) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const dateFilter: any = { paymentStatus: 'paid' };

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
    }

    const topItems = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit as string) },
    ]);

    res.json(topItems);
  } catch (error: any) {
    console.error('Error fetching top selling items:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch top selling items' });
  }
};

export const getRevenueSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analyticsService.getSalesStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch revenue summary' });
  }
};

export const getRepeatCustomers = async (req: Request, res: Response) => {
  try {
    const repeatCustomers = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$customerPhone',
          customerName: { $first: '$customerName' },
          customerEmail: { $first: '$customerEmail' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      {
        $match: {
          orderCount: { $gt: 1 },
        },
      },
      {
        $sort: { orderCount: -1 },
      },
      { $limit: 50 },
    ]);

    res.json(repeatCustomers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repeat customers' });
  }
};

export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analyticsService.getBookingStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking stats' });
  }
};


import { Order } from '../models/Order.model';
import { Booking } from '../models/Booking.model';
import { Menu } from '../models/Menu.model';

export const analyticsService = {
  async getSalesStats(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = startDate;
      if (endDate) dateFilter.createdAt.$lte = endDate;
    }

    const orders = await Order.find({
      ...dateFilter,
      paymentStatus: 'paid',
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      period: {
        start: startDate || null,
        end: endDate || null,
      },
    };
  },

  async getPopularItems(limit: number = 10) {
    const orders = await Order.find({ paymentStatus: 'paid' });
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItemId.toString();
        if (!itemCounts[key]) {
          itemCounts[key] = {
            name: item.name,
            count: 0,
            revenue: 0,
          };
        }
        itemCounts[key].count += item.quantity;
        itemCounts[key].revenue += item.price * item.quantity;
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  async getBookingStats(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = startDate;
      if (endDate) dateFilter.date.$lte = endDate;
    }

    const bookings = await Booking.find(dateFilter);
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    const totalGuests = bookings.reduce((sum, b) => sum + b.numberOfGuests, 0);

    return {
      total: bookings.length,
      confirmed,
      cancelled,
      totalGuests,
      averageGuests: bookings.length > 0 ? totalGuests / bookings.length : 0,
    };
  },

  async getMenuStats() {
    const totalItems = await Menu.countDocuments();
    const availableItems = await Menu.countDocuments({ available: true });
    const categories = await Menu.distinct('category');

    return {
      totalItems,
      availableItems,
      unavailableItems: totalItems - availableItems,
      categories: categories.length,
    };
  },
};


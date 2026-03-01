import { Request, Response } from 'express';
import { Order } from '../models/Order.model';
import { Bill } from '../models/Bill.model';
import mongoose from 'mongoose';

// Get revenue dashboard statistics
export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, period = 'all' } = req.query;

    // Calculate date range
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    } else if (period !== 'all') {
      const now = new Date();
      let start: Date;
      
      switch (period) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(0);
      }
      dateFilter.createdAt = { $gte: start, $lte: now };
    }

    // Get all paid orders
    const paidOrdersFilter = { ...dateFilter, paymentStatus: 'paid' };
    const paidOrders = await Order.find(paidOrdersFilter);

    // Get all paid bills
    const paidBillsFilter = { ...dateFilter, status: 'paid' };
    const paidBills = await Bill.find(paidBillsFilter);

    // Calculate total revenue from orders and bills
    const orderRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const billRevenue = paidBills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
    const totalRevenue = orderRevenue + billRevenue;

    // Count total orders
    const totalOrders = await Order.countDocuments(dateFilter);
    const paidOrdersCount = paidOrders.length;
    const pendingOrdersCount = await Order.countDocuments({ ...dateFilter, paymentStatus: 'pending' });

    // Count total bills
    const totalBills = await Bill.countDocuments(dateFilter);
    const paidBillsCount = paidBills.length;
    const unpaidBillsCount = await Bill.countDocuments({ ...dateFilter, status: 'unpaid' });

    // Count unique customers
    const uniqueCustomers = await Order.distinct('customerPhone', dateFilter);
    const totalCustomers = uniqueCustomers.length;

    // Payment method breakdown
    const paymentMethodStats = {
      cash: 0,
      card: 0,
      online: 0,
    };

    // From orders
    paidOrders.forEach((order) => {
      const method = order.paymentMethod || 'cash';
      if (method === 'cash') paymentMethodStats.cash += order.total || 0;
      else if (method === 'card') paymentMethodStats.card += order.total || 0;
      else if (method === 'online') paymentMethodStats.online += order.total || 0;
    });

    // From bills
    paidBills.forEach((bill) => {
      const method = bill.paymentMethod || 'cash';
      if (method === 'cash') paymentMethodStats.cash += bill.grandTotal || 0;
      else if (method === 'card') paymentMethodStats.card += bill.grandTotal || 0;
      else if (method === 'online') paymentMethodStats.online += bill.grandTotal || 0;
    });

    // Daily revenue trend (last 30 days)
    const dailyRevenue = [];
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(last30Days);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = await Order.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        paymentStatus: 'paid',
      });
      const dayBills = await Bill.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: 'paid',
      });

      const dayRevenue = 
        dayOrders.reduce((sum, o) => sum + (o.total || 0), 0) +
        dayBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

      dailyRevenue.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue,
      });
    }

    // Top selling items (from orders)
    const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.name;
        const existing = itemSales.get(key) || { name: key, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += (item.price * item.quantity);
        itemSales.set(key, existing);
      });
    });

    // From bills
    paidBills.forEach((bill) => {
      bill.items.forEach((item) => {
        const key = item.name;
        const existing = itemSales.get(key) || { name: key, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.total;
        itemSales.set(key, existing);
      });
    });

    const topSellingItems = Array.from(itemSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Average order value
    const avgOrderValue = paidOrders.length > 0 
      ? orderRevenue / paidOrders.length 
      : 0;

    // Average bill value
    const avgBillValue = paidBills.length > 0
      ? billRevenue / paidBills.length
      : 0;

    // Overall average transaction value
    const totalTransactions = paidOrders.length + paidBills.length;
    const avgTransactionValue = totalTransactions > 0
      ? totalRevenue / totalTransactions
      : 0;

    res.json({
      summary: {
        totalRevenue,
        orderRevenue,
        billRevenue,
        totalOrders,
        paidOrdersCount,
        pendingOrdersCount,
        totalBills,
        paidBillsCount,
        unpaidBillsCount,
        totalCustomers,
        avgOrderValue,
        avgBillValue,
        avgTransactionValue,
      },
      paymentMethods: paymentMethodStats,
      dailyRevenue,
      topSellingItems,
      period: period || 'all',
      dateRange: {
        start: startDate || null,
        end: endDate || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch revenue statistics' });
  }
};

// Get customer statistics
export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    // Get all customers with their order history
    const orders = await Order.find(dateFilter);
    const bills = await Bill.find(dateFilter);

    // Group by customer phone
    const customerMap = new Map<string, {
      name: string;
      phone: string;
      email?: string;
      totalOrders: number;
      totalBills: number;
      totalSpent: number;
      lastOrderDate: Date | null;
      firstOrderDate: Date | null;
    }>();

    // Process orders
    orders.forEach((order) => {
      const phone = order.customerPhone;
      if (!phone) return;

      const existing = customerMap.get(phone) || {
        name: order.customerName,
        phone,
        email: order.customerEmail,
        totalOrders: 0,
        totalBills: 0,
        totalSpent: 0,
        lastOrderDate: null,
        firstOrderDate: null,
      };

      existing.totalOrders++;
      if (order.paymentStatus === 'paid') {
        existing.totalSpent += order.total || 0;
      }
      
      const orderDate = order.createdAt;
      if (!existing.lastOrderDate || orderDate > existing.lastOrderDate) {
        existing.lastOrderDate = orderDate;
      }
      if (!existing.firstOrderDate || orderDate < existing.firstOrderDate) {
        existing.firstOrderDate = orderDate;
      }

      customerMap.set(phone, existing);
    });

    // Process bills
    bills.forEach((bill) => {
      const phone = bill.customerPhone;
      if (!phone) return;

      const existing = customerMap.get(phone) || {
        name: bill.customerName,
        phone,
        email: bill.customerEmail,
        totalOrders: 0,
        totalBills: 0,
        totalSpent: 0,
        lastOrderDate: null,
        firstOrderDate: null,
      };

      existing.totalBills++;
      if (bill.status === 'paid') {
        existing.totalSpent += bill.grandTotal || 0;
      }

      const billDate = bill.createdAt;
      if (!existing.lastOrderDate || billDate > existing.lastOrderDate) {
        existing.lastOrderDate = billDate;
      }
      if (!existing.firstOrderDate || billDate < existing.firstOrderDate) {
        existing.firstOrderDate = billDate;
      }

      customerMap.set(phone, existing);
    });

    const customers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);

    // Calculate statistics
    const totalCustomers = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

    // Top customers
    const topCustomers = customers.slice(0, 20);

    res.json({
      totalCustomers,
      totalSpent,
      avgSpentPerCustomer,
      customers: topCustomers,
    });
  } catch (error: any) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customer statistics' });
  }
};


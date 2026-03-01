'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  onlineVsCOD: {
    online: number;
    cod: number;
    onlinePercentage: number;
  };
}

interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

interface TopItem {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

const COLORS = ['#ea580c', '#16a34a', '#3b82f6', '#a855f7', '#ec4899'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsData = await api.get<DashboardStats>('/analytics/dashboard');
      setStats(statsData);

      // Load hourly data
      const hourly = await api.get<HourlyData[]>('/analytics/orders-per-hour', {
        params: dateRange.startDate ? { date: dateRange.startDate } : {},
      });
      setHourlyData(hourly);

      // Load top items
      const items = await api.get<TopItem[]>('/analytics/top-selling', {
        params: {
          limit: '10',
          ...(dateRange.startDate && { startDate: dateRange.startDate }),
          ...(dateRange.endDate && { endDate: dateRange.endDate }),
        },
      });
      setTopItems(items);

      // Load revenue summary
      const revenue = await api.get<any>('/analytics/revenue', {
        params: {
          ...(dateRange.startDate && { startDate: dateRange.startDate }),
          ...(dateRange.endDate && { endDate: dateRange.endDate }),
        },
      });
      setRevenueStats(revenue);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load analytics. Please check your connection.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const paymentData = stats ? [
    { name: 'Online', value: stats.onlineVsCOD.online },
    { name: 'COD', value: stats.onlineVsCOD.cod },
  ] : [];

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">Loading analytics...</div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-slate-900 rounded-xl p-6 border border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(revenueStats?.totalRevenue || stats.todayRevenue)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {revenueStats?.totalOrders || stats.todayOrders} orders
            </p>
          </motion.div>

          <motion.div
            className="bg-slate-900 rounded-xl p-6 border border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Average Order</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(revenueStats?.averageOrderValue || 0)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Per order</p>
          </motion.div>

          <motion.div
            className="bg-slate-900 rounded-xl p-6 border border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Pending Orders</p>
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
            <p className="text-xs text-slate-400 mt-1">Awaiting processing</p>
          </motion.div>

          <motion.div
            className="bg-slate-900 rounded-xl p-6 border border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Online Payment</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.onlineVsCOD.onlinePercentage}%
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.onlineVsCOD.online} online / {stats.onlineVsCOD.cod} COD
            </p>
          </motion.div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Per Hour */}
        <motion.div
          className="bg-slate-900 rounded-xl p-6 border border-slate-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Orders Per Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#ea580c"
                strokeWidth={2}
                name="Orders"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={2}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Method Distribution */}
        <motion.div
          className="bg-slate-900 rounded-xl p-6 border border-slate-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Selling Items */}
      <motion.div
        className="bg-slate-900 rounded-xl p-6 border border-slate-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Top Selling Items</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topItems.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="totalQuantity" fill="#ea580c" name="Quantity Sold" />
            <Bar dataKey="totalRevenue" fill="#16a34a" name="Revenue (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Items List */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 Items</h3>
        <div className="space-y-2">
          {topItems.slice(0, 10).map((item, index) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-sm text-slate-400">
                    {item.orderCount} orders • {item.totalQuantity} items sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{formatCurrency(item.totalRevenue)}</p>
                <p className="text-sm text-slate-400">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

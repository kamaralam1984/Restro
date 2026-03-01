'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, IndianRupee, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';

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

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number }>;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      // Load dashboard stats
      const statsData = await api.get<DashboardStats>('/analytics/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(statsData);

      // Load recent orders
      const ordersData = await api.get<Order[]>('/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: '10',
        },
      });
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 10) : []);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      loadDashboardData();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = stats ? [
    {
      title: 'Today Orders',
      value: `${stats.todayOrders} Orders`,
      icon: ShoppingBag,
      color: 'bg-orange-600',
    },
    {
      title: 'Today Revenue',
      value: formatCurrency(stats.todayRevenue),
      icon: IndianRupee,
      color: 'bg-green-600',
    },
    {
      title: 'Pending Orders',
      value: `${stats.pendingOrders} Orders`,
      icon: Clock,
      color: 'bg-orange-600',
    },
    {
      title: 'Online vs COD',
      value: `${stats.onlineVsCOD.onlinePercentage}%`,
      icon: CreditCard,
      color: 'bg-slate-800',
      subtitle: 'Donut chart',
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Welcome, Admin <span className="text-orange-600">🔥</span>
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((item, index) => (
          <motion.div
            key={index}
            className={`${item.color} rounded-xl p-6 text-white shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">{item.title}</p>
                <h2 className="text-2xl font-bold">{item.value}</h2>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <item.icon className="w-8 h-8" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Per Hour Chart */}
        <div className="bg-slate-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Orders Per Hour</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[0, 1, 50, 90, 130, 750, 400, 8300].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-orange-600 rounded-t"
                  style={{ height: `${Math.min((value / 8300) * 100, 100)}%` }}
                ></div>
                <span className="text-xs text-slate-400 mt-2">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-slate-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Selling Items</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🍛</span>
            </div>
            <div className="flex-1 space-y-2">
              {[1850, 3000, 773, 400].map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="bg-orange-600 h-6 rounded"
                    style={{ width: `${(value / 3000) * 100}%` }}
                  ></div>
                  <span className="text-sm text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Payment status</th>
                  <th className="text-left py-3 px-4">Order status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={order._id} className="border-b border-slate-800 hover:bg-slate-800 transition-colors">
                    <td className="py-4 px-4 text-white font-mono">#{order.orderNumber}</td>
                    <td className="py-4 px-4 text-white">{order.customerName}</td>
                    <td className="py-4 px-4 text-slate-300">
                      {order.items.length} items
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        ✓ {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'completed')}
                            className="px-3 py-1 bg-orange-600 text-white rounded text-xs font-semibold hover:bg-orange-700"
                          >
                            Deliver
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'ready')}
                            className="px-3 py-1 bg-orange-600 text-white rounded text-xs font-semibold hover:bg-orange-700"
                          >
                            Prepare
                          </button>
                        )}
                        {order.status !== 'completed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'completed')}
                            className="px-3 py-1 bg-slate-700 text-white rounded text-xs font-semibold hover:bg-slate-600"
                          >
                            Complete
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

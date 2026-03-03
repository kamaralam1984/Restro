'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
}

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params: Record<string, string> = {};
      if (filter === 'pending') params.paymentStatus = 'pending';
      else if (filter === 'paid') params.paymentStatus = 'paid';
      const data = await api.get<Order[]>('/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'paid'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded ${filter === f ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Paid'}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 rounded-xl p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Payment</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="py-4 px-4 text-white font-mono">#{order.orderNumber}</td>
                    <td className="py-4 px-4 text-white">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{order.items.length} items</td>
                    <td className="py-4 px-4 text-white font-semibold">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        order.status === 'completed' ? 'bg-green-600' : order.status === 'preparing' ? 'bg-orange-600' : 'bg-yellow-600'
                      }`}>{order.status}</span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        className="bg-slate-800 text-white text-xs px-3 py-1 rounded border border-slate-700"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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

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

export default function OrdersPage() {
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
      const params: any = {};

      if (filter === 'pending') {
        params.paymentStatus = 'pending';
      } else if (filter === 'paid') {
        params.paymentStatus = 'paid';
      }

      const data = await api.get<Order[]>('/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      await api.put(
        `/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6" style={{ background: '#080808' }}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Orders</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded"
            style={
              filter === 'all'
                ? { background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none', borderRadius: 10, fontWeight: 700 }
                : { background: '#1c1c1c', color: '#a89070', border: '1px solid rgba(200,151,42,0.15)', borderRadius: 10 }
            }
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className="px-4 py-2 rounded"
            style={
              filter === 'pending'
                ? { background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none', borderRadius: 10, fontWeight: 700 }
                : { background: '#1c1c1c', color: '#a89070', border: '1px solid rgba(200,151,42,0.15)', borderRadius: 10 }
            }
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('paid')}
            className="px-4 py-2 rounded"
            style={
              filter === 'paid'
                ? { background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none', borderRadius: 10, fontWeight: 700 }
                : { background: '#1c1c1c', color: '#a89070', border: '1px solid rgba(200,151,42,0.15)', borderRadius: 10 }
            }
          >
            Paid
          </button>
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
        {loading ? (
          <div className="text-center py-8" style={{ color: '#a89070' }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#a89070' }}>No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order ID</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Customer</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Items</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Payment</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#141414')}
                  >
                    <td className="py-4 px-4 font-mono" style={{ color: '#f0c060' }}>#{order.orderNumber}</td>
                    <td className="py-4 px-4" style={{ color: '#f8f4ed' }}>
                      <div>{order.customerName}</div>
                      <div className="text-xs" style={{ color: '#a89070' }}>{order.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4" style={{ color: '#a89070' }}>{order.items.length} items</td>
                    <td className="py-4 px-4 font-semibold" style={{ color: '#f0c060', fontWeight: 900 }}>{formatCurrency(order.total)}</td>
                    <td className="py-4 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={
                          order.paymentStatus === 'paid'
                            ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                            : { background: 'rgba(200,151,42,0.1)', color: '#c8972a' }
                        }
                      >
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={
                          order.status === 'completed'
                            ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                            : order.status === 'preparing'
                            ? { background: 'rgba(200,151,42,0.1)', color: '#c8972a' }
                            : { background: 'rgba(240,192,96,0.1)', color: '#f0c060' }
                        }
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        className="text-xs px-3 py-1 rounded"
                        style={{ background: '#1c1c1c', color: '#f8f4ed', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 10, outline: 'none' }}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = '#c8972a')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
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

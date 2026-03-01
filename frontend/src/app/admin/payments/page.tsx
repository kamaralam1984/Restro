'use client';

import { useState, useEffect } from 'react';
import { Wallet, IndianRupee, CreditCard, Banknote, Search, Filter } from 'lucide-react';
import api from '@/services/api';

interface PaymentRow {
  id: string;
  type: 'order' | 'bill';
  reference: string;
  customer: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, billsRes] = await Promise.all([
        api.get<any[]>('/orders', { headers }).catch(() => []),
        api.get<any[]>('/billing', { headers }).catch(() => []),
      ]);

      const orders = Array.isArray(ordersRes) ? ordersRes : [];
      const bills = Array.isArray(billsRes) ? billsRes : [];

      const rows: PaymentRow[] = [
        ...orders.map((o: any) => ({
          id: o._id,
          type: 'order' as const,
          reference: o.orderNumber ? `#${o.orderNumber}` : o._id?.slice(-6) || '—',
          customer: o.customerName || '—',
          amount: o.total ?? 0,
          method: o.paymentMethod || 'cash',
          status: o.paymentStatus === 'paid' ? 'paid' : 'pending',
          date: o.createdAt,
        })),
        ...bills.map((b: any) => ({
          id: b._id,
          type: 'bill' as const,
          reference: b.billNumber ? `Bill ${b.billNumber}` : b._id?.slice(-6) || '—',
          customer: b.customerName || '—',
          amount: b.grandTotal ?? b.subtotal ?? 0,
          method: b.paymentMethod || 'cash',
          status: b.status === 'paid' ? 'paid' : 'pending',
          date: b.createdAt,
        })),
      ];

      rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPayments(rows);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    if (filter === 'paid' && p.status !== 'paid') return false;
    if (filter === 'pending' && p.status !== 'pending') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.reference.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPaid = filtered.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = filtered.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-7 h-7 text-orange-500" />
          Payment Details
        </h1>
        <p className="text-slate-400 text-sm mt-1">All payments from orders and bills — view and track payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600/30 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Received (filtered)</p>
            <p className="text-xl font-bold text-green-400">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600/30 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Pending (filtered)</p>
            <p className="text-xl font-bold text-orange-400">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'paid', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'paid' ? 'Paid' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-left">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Reference</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Method</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={`${p.type}-${p.id}`} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(p.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.type === 'order' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'
                      }`}>
                        {p.type === 'order' ? 'Order' : 'Bill'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{p.reference}</td>
                    <td className="py-3 px-4 text-slate-300">{p.customer}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-400">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-400 capitalize">{p.method}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'paid' ? 'bg-green-600/20 text-green-400' : 'bg-orange-600/20 text-orange-400'
                      }`}>
                        {p.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
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

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
    <div className="space-y-6" style={{ background: '#080808' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f8f4ed' }}>
          <Wallet className="w-7 h-7" style={{ color: '#c8972a' }} />
          Payment Details
        </h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>All payments from orders and bills — view and track payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.15)' }}
          >
            <IndianRupee className="w-6 h-6" style={{ color: '#22c55e' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: '#a89070' }}>Total Received (filtered)</p>
            <p className="text-xl font-bold" style={{ color: '#22c55e' }}>₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: 'rgba(200,151,42,0.08)',
            border: '1px solid rgba(200,151,42,0.25)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(200,151,42,0.12)' }}
          >
            <Wallet className="w-6 h-6" style={{ color: '#c8972a' }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: '#a89070' }}>Pending (filtered)</p>
            <p className="text-xl font-bold" style={{ color: '#f0c060' }}>₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
          <input
            type="text"
            placeholder="Search by reference or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              color: '#f8f4ed',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'paid', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 text-sm font-semibold transition-colors"
              style={
                filter === f
                  ? {
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid rgba(200,151,42,0.3)',
                      color: '#c8972a',
                      borderRadius: '10px',
                    }
              }
            >
              {f === 'all' ? 'All' : f === 'paid' ? 'Paid' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.13)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="animate-spin rounded-full h-10 w-10"
              style={{
                border: '3px solid rgba(200,151,42,0.2)',
                borderTopColor: '#c8972a',
              }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#a89070' }}>No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left"
                  style={{
                    background: '#1c1c1c',
                    borderBottom: '1px solid rgba(200,151,42,0.15)',
                  }}
                >
                  <th className="py-4 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Date</th>
                  <th className="py-4 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Type</th>
                  <th className="py-4 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reference</th>
                  <th className="py-4 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Customer</th>
                  <th className="py-4 px-4 text-right" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Amount</th>
                  <th className="py-4 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Method</th>
                  <th className="py-4 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={`${p.type}-${p.id}`}
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#141414')}
                  >
                    <td className="py-3 px-4" style={{ color: '#f8f4ed' }}>
                      {new Date(p.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={
                          p.type === 'order'
                            ? { background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }
                            : { background: 'rgba(168,85,247,0.1)', color: '#c084fc' }
                        }
                      >
                        {p.type === 'order' ? 'Order' : 'Bill'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium" style={{ color: '#f8f4ed' }}>{p.reference}</td>
                    <td className="py-3 px-4" style={{ color: '#a89070' }}>{p.customer}</td>
                    <td className="py-3 px-4 text-right font-semibold" style={{ color: '#22c55e' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 capitalize" style={{ color: '#a89070' }}>{p.method}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          p.status === 'paid'
                            ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                            : { background: 'rgba(240,192,96,0.1)', color: '#f0c060' }
                        }
                      >
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

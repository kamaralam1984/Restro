'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, Receipt, DollarSign, Calendar, Filter, Download } from 'lucide-react';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface RevenueStats {
  summary: {
    totalRevenue: number;
    orderRevenue: number;
    billRevenue: number;
    totalOrders: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    totalBills: number;
    paidBillsCount: number;
    unpaidBillsCount: number;
    totalCustomers: number;
    avgOrderValue: number;
    avgBillValue: number;
    avgTransactionValue: number;
  };
  paymentMethods: {
    cash: number;
    card: number;
    online: number;
  };
  dailyRevenue: Array<{ date: string; revenue: number }>;
  topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
  period: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface CustomerStats {
  totalCustomers: number;
  totalSpent: number;
  avgSpentPerCustomer: number;
  customers: Array<{
    name: string;
    phone: string;
    email?: string;
    totalOrders: number;
    totalBills: number;
    totalSpent: number;
    lastOrderDate: Date | null;
    firstOrderDate: Date | null;
  }>;
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'customers'>('overview');

  useEffect(() => {
    loadRevenueStats();
    loadCustomerStats();
  }, [period, startDate, endDate]);

  const loadRevenueStats = async () => {
    try {
      setLoading(true);
      const params: any = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await api.get<RevenueStats>('/revenue/stats', { params });
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load revenue stats:', error);
      toast.error(error?.message || 'Failed to load revenue statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerStats = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await api.get<CustomerStats>('/revenue/customers', { params });
      setCustomerStats(data);
    } catch (error: any) {
      console.error('Failed to load customer stats:', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const exportToCSV = () => {
    if (!stats) return;

    const csv = [
      ['Revenue Report', ''],
      ['Period', period],
      ['Total Revenue', formatCurrency(stats.summary.totalRevenue)],
      ['Total Orders', stats.summary.totalOrders],
      ['Total Customers', stats.summary.totalCustomers],
      [''],
      ['Payment Methods', ''],
      ['Cash', formatCurrency(stats.paymentMethods.cash)],
      ['Card', formatCurrency(stats.paymentMethods.card)],
      ['Online', formatCurrency(stats.paymentMethods.online)],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#080808' }}>
        <div style={{ color: '#a89070' }}>Loading revenue statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#080808' }}>
        <div style={{ color: '#ef4444' }}>Failed to load revenue statistics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ background: '#080808', minHeight: '100vh', padding: '24px' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed', fontWeight: 800 }}>Revenue Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            background: 'rgba(34,197,94,0.1)',
            color: '#22c55e',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '10px',
            fontWeight: 700,
          }}
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: '#a89070' }} />
            <span className="text-sm" style={{ color: '#a89070' }}>Period:</span>
          </div>
          {(['all', 'today', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={
                period === p
                  ? {
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }
                  : {
                      background: '#1c1c1c',
                      color: '#a89070',
                      border: '1px solid rgba(200,151,42,0.15)',
                      borderRadius: '10px',
                    }
              }
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
              style={{
                padding: '10px 14px',
                background: '#1c1c1c',
                color: '#f8f4ed',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: '10px',
                outline: 'none',
              }}
              placeholder="Start Date"
            />
            <span style={{ color: '#a89070' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm"
              style={{
                padding: '10px 14px',
                background: '#1c1c1c',
                color: '#f8f4ed',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: '10px',
                outline: 'none',
              }}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className="px-4 py-2 font-semibold transition-colors"
          style={
            activeTab === 'overview'
              ? { color: '#c8972a', borderBottom: '2px solid #c8972a', background: 'transparent' }
              : { color: '#a89070', background: 'transparent', border: 'none' }
          }
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className="px-4 py-2 font-semibold transition-colors"
          style={
            activeTab === 'customers'
              ? { color: '#c8972a', borderBottom: '2px solid #c8972a', background: 'transparent' }
              : { color: '#a89070', background: 'transparent', border: 'none' }
          }
        >
          Customers
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="rounded-xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.08))',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '16px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8" style={{ color: '#22c55e', opacity: 0.8 }} />
                <TrendingUp className="w-5 h-5" style={{ color: '#22c55e' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#f0c060', fontWeight: 900 }}>{formatCurrency(stats.summary.totalRevenue)}</div>
              <div className="text-sm" style={{ color: '#a89070' }}>Total Revenue</div>
            </div>

            <div
              className="rounded-xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(96,165,250,0.08))',
                border: '1px solid rgba(96,165,250,0.25)',
                borderRadius: '16px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8" style={{ color: '#60a5fa', opacity: 0.8 }} />
                <TrendingUp className="w-5 h-5" style={{ color: '#60a5fa' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#f0c060', fontWeight: 900 }}>{stats.summary.totalCustomers}</div>
              <div className="text-sm" style={{ color: '#a89070' }}>Total Customers</div>
            </div>

            <div
              className="rounded-xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.08))',
                border: '1px solid rgba(168,85,247,0.25)',
                borderRadius: '16px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-8 h-8" style={{ color: '#c084fc', opacity: 0.8 }} />
                <TrendingUp className="w-5 h-5" style={{ color: '#c084fc' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#f0c060', fontWeight: 900 }}>{stats.summary.totalOrders}</div>
              <div className="text-sm" style={{ color: '#a89070' }}>Total Orders</div>
            </div>

            <div
              className="rounded-xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(200,151,42,0.15), rgba(200,151,42,0.08))',
                border: '1px solid rgba(200,151,42,0.25)',
                borderRadius: '16px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Receipt className="w-8 h-8" style={{ color: '#c8972a', opacity: 0.8 }} />
                <TrendingUp className="w-5 h-5" style={{ color: '#c8972a' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#f0c060', fontWeight: 900 }}>{stats.summary.totalBills}</div>
              <div className="text-sm" style={{ color: '#a89070' }}>Total Bills</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <div
              className="rounded-xl p-6"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Revenue Breakdown</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Order Revenue</span>
                  <span className="font-semibold" style={{ color: '#f8f4ed' }}>{formatCurrency(stats.summary.orderRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Bill Revenue</span>
                  <span className="font-semibold" style={{ color: '#f8f4ed' }}>{formatCurrency(stats.summary.billRevenue)}</span>
                </div>
                <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(200,151,42,0.15)' }}>
                  <span className="font-semibold" style={{ color: '#f8f4ed' }}>Total Revenue</span>
                  <span className="font-bold text-xl" style={{ color: '#f0c060' }}>{formatCurrency(stats.summary.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div
              className="rounded-xl p-6"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Payment Methods</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: '#a89070' }}>Cash</span>
                    <span className="font-semibold" style={{ color: '#f8f4ed' }}>{formatCurrency(stats.paymentMethods.cash)}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: '#1c1c1c' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(stats.paymentMethods.cash / stats.summary.totalRevenue) * 100}%`,
                        background: '#22c55e',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: '#a89070' }}>Card</span>
                    <span className="font-semibold" style={{ color: '#f8f4ed' }}>{formatCurrency(stats.paymentMethods.card)}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: '#1c1c1c' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(stats.paymentMethods.card / stats.summary.totalRevenue) * 100}%`,
                        background: '#60a5fa',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: '#a89070' }}>Online</span>
                    <span className="font-semibold" style={{ color: '#f8f4ed' }}>{formatCurrency(stats.paymentMethods.online)}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: '#1c1c1c' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(stats.paymentMethods.online / stats.summary.totalRevenue) * 100}%`,
                        background: '#c084fc',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Average Values */}
            <div
              className="rounded-xl p-6"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Average Values</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Avg Order Value</span>
                  <span className="font-semibold" style={{ color: '#f8f4ed' }}>{formatCurrency(stats.summary.avgOrderValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Avg Bill Value</span>
                  <span className="font-semibold" style={{ color: '#f8f4ed' }}>{formatCurrency(stats.summary.avgBillValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Avg Transaction Value</span>
                  <span className="font-semibold" style={{ color: '#c8972a' }}>{formatCurrency(stats.summary.avgTransactionValue)}</span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div
              className="rounded-xl p-6"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Order Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Paid Orders</span>
                  <span className="font-semibold" style={{ color: '#22c55e' }}>{stats.summary.paidOrdersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Pending Orders</span>
                  <span className="font-semibold" style={{ color: '#f0c060' }}>{stats.summary.pendingOrdersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Paid Bills</span>
                  <span className="font-semibold" style={{ color: '#22c55e' }}>{stats.summary.paidBillsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#a89070' }}>Unpaid Bills</span>
                  <span className="font-semibold" style={{ color: '#ef4444' }}>{stats.summary.unpaidBillsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div
            className="rounded-xl p-6"
            style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Daily Revenue Trend (Last 30 Days)</h2>
            <div className="h-64 flex items-end justify-between gap-1">
              {stats.dailyRevenue.map((day, index) => {
                const maxRevenue = Math.max(...stats.dailyRevenue.map(d => d.revenue));
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${height}%`,
                        minHeight: height > 0 ? '4px' : '0',
                        background: 'linear-gradient(to top, #8b5a00, #c8972a)',
                      }}
                      title={`${formatDate(day.date)}: ${formatCurrency(day.revenue)}`}
                    />
                    {index % 5 === 0 && (
                      <span className="text-xs transform -rotate-45 origin-top-left" style={{ color: '#6b5040' }}>
                        {formatDate(day.date)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Selling Items */}
          <div
            className="rounded-xl p-6"
            style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Top Selling Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                    <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Rank</th>
                    <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Item Name</th>
                    <th className="text-right py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quantity</th>
                    <th className="text-right py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSellingItems.map((item, index) => (
                    <tr
                      key={index}
                      style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#141414')}
                    >
                      <td className="py-3 px-4" style={{ color: '#a89070' }}>#{index + 1}</td>
                      <td className="py-3 px-4 font-medium" style={{ color: '#f8f4ed' }}>{item.name}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#a89070' }}>{item.quantity}</td>
                      <td className="py-3 px-4 font-semibold text-right" style={{ color: '#c8972a' }}>{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'customers' && customerStats && (
        <div
          className="rounded-xl p-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '16px' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="rounded-lg p-4"
              style={{ background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '12px' }}
            >
              <div className="text-sm mb-1" style={{ color: '#a89070', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>Total Customers</div>
              <div className="text-2xl font-bold" style={{ color: '#f0c060', fontWeight: 900 }}>{customerStats.totalCustomers}</div>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '12px' }}
            >
              <div className="text-sm mb-1" style={{ color: '#a89070', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>Total Spent</div>
              <div className="text-2xl font-bold" style={{ color: '#f0c060', fontWeight: 900 }}>{formatCurrency(customerStats.totalSpent)}</div>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.13)', borderRadius: '12px' }}
            >
              <div className="text-sm mb-1" style={{ color: '#a89070', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>Avg per Customer</div>
              <div className="text-2xl font-bold" style={{ color: '#22c55e', fontWeight: 900 }}>{formatCurrency(customerStats.avgSpentPerCustomer)}</div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Name</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Phone</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</th>
                  <th className="text-right py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Orders</th>
                  <th className="text-right py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Bills</th>
                  <th className="text-right py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Spent</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {customerStats.customers.map((customer, index) => (
                  <tr
                    key={index}
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#141414')}
                  >
                    <td className="py-3 px-4 font-medium" style={{ color: '#f8f4ed' }}>{customer.name}</td>
                    <td className="py-3 px-4" style={{ color: '#a89070' }}>{customer.phone}</td>
                    <td className="py-3 px-4" style={{ color: '#a89070' }}>{customer.email || '-'}</td>
                    <td className="py-3 px-4 text-right" style={{ color: '#a89070' }}>{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-right" style={{ color: '#a89070' }}>{customer.totalBills}</td>
                    <td className="py-3 px-4 font-semibold text-right" style={{ color: '#c8972a' }}>{formatCurrency(customer.totalSpent)}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#6b5040' }}>
                      {customer.lastOrderDate
                        ? new Date(customer.lastOrderDate).toLocaleDateString('en-IN')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

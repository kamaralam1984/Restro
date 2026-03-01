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
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Loading revenue statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400">Failed to load revenue statistics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Revenue Management</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 text-sm">Period:</span>
          </div>
          {(['all', 'today', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setStartDate('');
                setEndDate('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                period === p
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 text-sm"
              placeholder="Start Date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 text-sm"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'customers'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Customers
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(stats.summary.totalRevenue)}</div>
              <div className="text-sm opacity-90">Total Revenue</div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{stats.summary.totalCustomers}</div>
              <div className="text-sm opacity-90">Total Customers</div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{stats.summary.totalOrders}</div>
              <div className="text-sm opacity-90">Total Orders</div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Receipt className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{stats.summary.totalBills}</div>
              <div className="text-sm opacity-90">Total Bills</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Order Revenue</span>
                  <span className="text-white font-semibold">{formatCurrency(stats.summary.orderRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Bill Revenue</span>
                  <span className="text-white font-semibold">{formatCurrency(stats.summary.billRevenue)}</span>
                </div>
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                  <span className="text-white font-semibold">Total Revenue</span>
                  <span className="text-orange-600 font-bold text-xl">{formatCurrency(stats.summary.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Payment Methods</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Cash</span>
                    <span className="text-white font-semibold">{formatCurrency(stats.paymentMethods.cash)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(stats.paymentMethods.cash / stats.summary.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Card</span>
                    <span className="text-white font-semibold">{formatCurrency(stats.paymentMethods.card)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(stats.paymentMethods.card / stats.summary.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Online</span>
                    <span className="text-white font-semibold">{formatCurrency(stats.paymentMethods.online)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(stats.paymentMethods.online / stats.summary.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Average Values */}
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Average Values</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Avg Order Value</span>
                  <span className="text-white font-semibold">{formatCurrency(stats.summary.avgOrderValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Avg Bill Value</span>
                  <span className="text-white font-semibold">{formatCurrency(stats.summary.avgBillValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Avg Transaction Value</span>
                  <span className="text-orange-600 font-semibold">{formatCurrency(stats.summary.avgTransactionValue)}</span>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-slate-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Order Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Paid Orders</span>
                  <span className="text-green-600 font-semibold">{stats.summary.paidOrdersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Pending Orders</span>
                  <span className="text-yellow-600 font-semibold">{stats.summary.pendingOrdersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Paid Bills</span>
                  <span className="text-green-600 font-semibold">{stats.summary.paidBillsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Unpaid Bills</span>
                  <span className="text-red-600 font-semibold">{stats.summary.unpaidBillsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Daily Revenue Trend (Last 30 Days)</h2>
            <div className="h-64 flex items-end justify-between gap-1">
              {stats.dailyRevenue.map((day, index) => {
                const maxRevenue = Math.max(...stats.dailyRevenue.map(d => d.revenue));
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-orange-600 to-orange-500 rounded-t transition-all hover:from-orange-500 hover:to-orange-400"
                      style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                      title={`${formatDate(day.date)}: ${formatCurrency(day.revenue)}`}
                    />
                    {index % 5 === 0 && (
                      <span className="text-xs text-slate-400 transform -rotate-45 origin-top-left">
                        {formatDate(day.date)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Top Selling Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Item Name</th>
                    <th className="text-right py-3 px-4">Quantity</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSellingItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-800 hover:bg-slate-800">
                      <td className="py-3 px-4 text-slate-300">#{index + 1}</td>
                      <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-slate-300 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-orange-600 font-semibold text-right">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'customers' && customerStats && (
        <div className="bg-slate-900 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Total Customers</div>
              <div className="text-2xl font-bold text-white">{customerStats.totalCustomers}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(customerStats.totalSpent)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Avg per Customer</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(customerStats.avgSpentPerCustomer)}</div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-white mb-4">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-right py-3 px-4">Orders</th>
                  <th className="text-right py-3 px-4">Bills</th>
                  <th className="text-right py-3 px-4">Total Spent</th>
                  <th className="text-left py-3 px-4">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {customerStats.customers.map((customer, index) => (
                  <tr key={index} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="py-3 px-4 text-white font-medium">{customer.name}</td>
                    <td className="py-3 px-4 text-slate-300">{customer.phone}</td>
                    <td className="py-3 px-4 text-slate-300">{customer.email || '-'}</td>
                    <td className="py-3 px-4 text-slate-300 text-right">{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-slate-300 text-right">{customer.totalBills}</td>
                    <td className="py-3 px-4 text-orange-600 font-semibold text-right">{formatCurrency(customer.totalSpent)}</td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
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


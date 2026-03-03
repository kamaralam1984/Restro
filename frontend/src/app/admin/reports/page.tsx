'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Calendar, Filter, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';

type Period = 'day' | 'week' | 'month' | 'year';

interface Bill {
  _id: string;
  billNumber: string;
  createdAt: string;
  source: 'online' | 'offline';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'unpaid' | 'paid' | 'cancelled';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);

  const effectiveRange = useMemo(() => {
    // If custom range is set, use that directly
    if (startDate || endDate) {
      return {
        start: startDate || '',
        end: endDate || '',
      };
    }
    const now = new Date();
    let start = new Date(now);
    if (period === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { start: fmt(start), end: fmt(now) };
  }, [period, startDate, endDate]);

  const totals = useMemo(
    () =>
      bills.reduce(
        (acc, b) => {
          acc.subtotal += b.subtotal || 0;
          acc.taxAmount += b.taxAmount || 0;
          acc.discountAmount += b.discountAmount || 0;
          acc.deliveryCharge += b.deliveryCharge || 0;
          acc.grandTotal += b.grandTotal || 0;
          return acc;
        },
        { subtotal: 0, taxAmount: 0, discountAmount: 0, deliveryCharge: 0, grandTotal: 0 }
      ),
    [bills]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoadingBills(true);
        const params: any = {};
        if (effectiveRange.start) params.startDate = effectiveRange.start;
        if (effectiveRange.end) params.endDate = effectiveRange.end;
        const data = await api.get<Bill[]>('/billing', { params });
        setBills(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load bills for reports:', err);
        toast.error(err?.message || 'Failed to load billing data');
        setBills([]);
      } finally {
        setLoadingBills(false);
      }
    };
    loadBills();
  }, [effectiveRange.start, effectiveRange.end]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Session expired. Please login again.');
        return;
      }

      const params = new URLSearchParams();
      params.set('period', period);
      if (effectiveRange.start) params.set('startDate', effectiveRange.start);
      if (effectiveRange.end) params.set('endDate', effectiveRange.end);

      const url = `${API_BASE_URL}/billing/report/pdf?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to download report');
      }

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      a.href = href;
      a.download = `billing-report-${period}-${today}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
      toast.success('PDF report downloaded');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            Billing Reports (GST / Audit)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Download daily, weekly, monthly or yearly billing reports as PDF for GST returns, audit and management.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 text-sm">Period:</span>
          </div>
          {([
            { key: 'day', label: 'Today' },
            { key: 'week', label: 'This week' },
            { key: 'month', label: 'This month' },
            { key: 'year', label: 'This year' },
          ] as { key: Period; label: string }[]).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                setPeriod(p.key);
                setStartDate('');
                setEndDate('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                period === p.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}

          <div className="flex items-center gap-2 ml-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 text-sm"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          If you select a custom date range, it will be used instead of the quick period filter above.
        </p>
      </div>

      {/* Summary + grid view */}
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase mb-1">Subtotal</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(totals.subtotal)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase mb-1">GST</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(totals.taxAmount)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase mb-1">Discount</p>
            <p className="text-lg font-semibold text-white">-{formatCurrency(totals.discountAmount)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase mb-1">Grand Total</p>
            <p className="text-lg font-semibold text-orange-400">{formatCurrency(totals.grandTotal)}</p>
          </div>
        </div>

        {/* Bills grid */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              Bills for {effectiveRange.start} to {effectiveRange.end}
            </h2>
            <span className="text-xs text-slate-400">
              {loadingBills ? 'Loading…' : `${bills.length} bill${bills.length === 1 ? '' : 's'}`}
            </span>
          </div>
          {loadingBills ? (
            <div className="p-6 text-slate-400 text-sm">Loading billing data…</div>
          ) : bills.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm">No bills found for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-300">Date / Time</th>
                    <th className="px-4 py-2 text-left text-slate-300">Bill #</th>
                    <th className="px-4 py-2 text-left text-slate-300">Source</th>
                    <th className="px-4 py-2 text-right text-slate-300">Subtotal</th>
                    <th className="px-4 py-2 text-right text-slate-300">GST</th>
                    <th className="px-4 py-2 text-right text-slate-300">Discount</th>
                    <th className="px-4 py-2 text-right text-slate-300">Grand Total</th>
                    <th className="px-4 py-2 text-left text-slate-300">Payment</th>
                    <th className="px-4 py-2 text-left text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b) => (
                    <tr key={b._id} className="border-b border-slate-800 hover:bg-slate-800/60">
                      <td className="px-4 py-2 text-slate-200 whitespace-nowrap">
                        {formatDateTime(b.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-slate-200">{b.billNumber}</td>
                      <td className="px-4 py-2 text-slate-300 capitalize">{b.source}</td>
                      <td className="px-4 py-2 text-right text-slate-200">
                        {formatCurrency(b.subtotal)}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-200">
                        {formatCurrency(b.taxAmount)}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-200">
                        -{formatCurrency(b.discountAmount)}
                      </td>
                      <td className="px-4 py-2 text-right text-orange-400">
                        {formatCurrency(b.grandTotal)}
                      </td>
                      <td className="px-4 py-2 text-slate-300 capitalize">{b.paymentMethod}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            b.status === 'paid'
                              ? 'bg-green-600/20 text-green-300 border border-green-600/40'
                              : b.status === 'unpaid'
                                ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/40'
                                : 'bg-red-600/20 text-red-300 border border-red-600/40'
                          }`}
                        >
                          {b.status.toUpperCase()}
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
    </div>
  );
}


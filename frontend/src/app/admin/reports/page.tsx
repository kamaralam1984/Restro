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
    <div className="space-y-6" style={{ background: '#080808', minHeight: '100%' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl flex items-center gap-2" style={{ color: '#f8f4ed', fontWeight: 800 }}>
            <FileText className="w-6 h-6" style={{ color: '#c8972a' }} />
            Billing Reports (GST / Audit)
          </h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>
            Download daily, weekly, monthly or yearly billing reports as PDF for GST returns, audit and management.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
            color: '#080808',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4"
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.13)',
          borderRadius: 16,
        }}
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: '#a89070' }} />
            <span className="text-sm" style={{ color: '#f8f4ed' }}>Period:</span>
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
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={
                period === p.key
                  ? {
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 700,
                    }
                  : {
                      background: '#1c1c1c',
                      color: '#a89070',
                      border: '1px solid rgba(200,151,42,0.15)',
                      borderRadius: 10,
                      fontWeight: 600,
                    }
              }
            >
              {p.label}
            </button>
          ))}

          <div className="flex items-center gap-2 ml-auto">
            <Calendar className="w-4 h-4" style={{ color: '#a89070' }} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm rounded"
              style={{
                background: '#1c1c1c',
                color: '#f8f4ed',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: 10,
                outline: 'none',
              }}
            />
            <span className="text-sm" style={{ color: '#a89070' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-sm rounded"
              style={{
                background: '#1c1c1c',
                color: '#f8f4ed',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: 10,
                outline: 'none',
              }}
            />
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: '#6b5040' }}>
          If you select a custom date range, it will be used instead of the quick period filter above.
        </p>
      </div>

      {/* Summary + grid view */}
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.13)',
              borderRadius: 16,
            }}
          >
            <p
              className="text-xs uppercase mb-1"
              style={{ color: '#a89070', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              Subtotal
            </p>
            <p className="text-lg" style={{ color: '#f8f4ed', fontWeight: 900 }}>
              {formatCurrency(totals.subtotal)}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.13)',
              borderRadius: 16,
            }}
          >
            <p
              className="text-xs uppercase mb-1"
              style={{ color: '#a89070', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              GST
            </p>
            <p className="text-lg" style={{ color: '#f8f4ed', fontWeight: 900 }}>
              {formatCurrency(totals.taxAmount)}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.13)',
              borderRadius: 16,
            }}
          >
            <p
              className="text-xs uppercase mb-1"
              style={{ color: '#a89070', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              Discount
            </p>
            <p className="text-lg" style={{ color: '#f8f4ed', fontWeight: 900 }}>
              -{formatCurrency(totals.discountAmount)}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.13)',
              borderRadius: 16,
            }}
          >
            <p
              className="text-xs uppercase mb-1"
              style={{ color: '#a89070', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              Grand Total
            </p>
            <p className="text-lg" style={{ color: '#f0c060', fontWeight: 900 }}>
              {formatCurrency(totals.grandTotal)}
            </p>
          </div>
        </div>

        {/* Bills grid */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: '#141414',
            border: '1px solid rgba(200,151,42,0.13)',
            borderRadius: 16,
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(200,151,42,0.13)' }}
          >
            <h2 className="text-sm" style={{ color: '#f8f4ed', fontWeight: 700 }}>
              Bills for {effectiveRange.start} to {effectiveRange.end}
            </h2>
            <span className="text-xs" style={{ color: '#a89070' }}>
              {loadingBills ? 'Loading…' : `${bills.length} bill${bills.length === 1 ? '' : 's'}`}
            </span>
          </div>
          {loadingBills ? (
            <div className="p-6 text-sm" style={{ color: '#a89070' }}>Loading billing data…</div>
          ) : bills.length === 0 ? (
            <div className="p-6 text-sm" style={{ color: '#a89070' }}>No bills found for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{ background: '#1c1c1c' }}>
                    <th
                      className="px-4 py-2 text-left"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Date / Time
                    </th>
                    <th
                      className="px-4 py-2 text-left"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Bill #
                    </th>
                    <th
                      className="px-4 py-2 text-left"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Source
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Subtotal
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      GST
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Discount
                    </th>
                    <th
                      className="px-4 py-2 text-right"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Grand Total
                    </th>
                    <th
                      className="px-4 py-2 text-left"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Payment
                    </th>
                    <th
                      className="px-4 py-2 text-left"
                      style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b) => (
                    <tr
                      key={b._id}
                      style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#1c1c1c'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#141414'; }}
                    >
                      <td className="px-4 py-2 whitespace-nowrap" style={{ color: '#f8f4ed' }}>
                        {formatDateTime(b.createdAt)}
                      </td>
                      <td className="px-4 py-2" style={{ color: '#f8f4ed' }}>{b.billNumber}</td>
                      <td className="px-4 py-2 capitalize" style={{ color: '#a89070' }}>{b.source}</td>
                      <td className="px-4 py-2 text-right" style={{ color: '#f8f4ed' }}>
                        {formatCurrency(b.subtotal)}
                      </td>
                      <td className="px-4 py-2 text-right" style={{ color: '#f8f4ed' }}>
                        {formatCurrency(b.taxAmount)}
                      </td>
                      <td className="px-4 py-2 text-right" style={{ color: '#f8f4ed' }}>
                        -{formatCurrency(b.discountAmount)}
                      </td>
                      <td className="px-4 py-2 text-right" style={{ color: '#f0c060' }}>
                        {formatCurrency(b.grandTotal)}
                      </td>
                      <td className="px-4 py-2 capitalize" style={{ color: '#a89070' }}>{b.paymentMethod}</td>
                      <td className="px-4 py-2">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={
                            b.status === 'paid'
                              ? {
                                  background: 'rgba(34,197,94,0.1)',
                                  color: '#22c55e',
                                  border: '1px solid rgba(34,197,94,0.3)',
                                }
                              : b.status === 'unpaid'
                                ? {
                                    background: 'rgba(240,192,96,0.1)',
                                    color: '#f0c060',
                                    border: '1px solid rgba(240,192,96,0.3)',
                                  }
                                : {
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                  }
                          }
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

'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Save, Loader2, BadgePercent, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';
import { getHourlyRate } from '@/utils/booking.utils';

interface TableRow {
  _id: string;
  tableNumber: string;
  capacity: number;
  hourlyRate?: number;
  discountThreshold?: number;
  discountAmount?: number;
}

function getDefaultThreshold(capacity: number): number {
  if (capacity >= 6) return 1500;
  if (capacity >= 4) return 1000;
  return 500;
}

export default function TableRatesPage() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { hourlyRate: string; discountThreshold: string; discountAmount: string }>>({});

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const admin = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
      let slug: string | undefined;
      try {
        if (admin) slug = JSON.parse(admin).restaurantSlug;
      } catch {}
      const params = slug ? { restaurant: slug } : {};
      const data = await api.get<TableRow[]>('/tables', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(Array.isArray(data) ? data : []);
      setEdits({});
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to load tables');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const getEdit = (t: TableRow) => {
    return edits[t._id] ?? {
      hourlyRate: t.hourlyRate != null ? String(t.hourlyRate) : '',
      discountThreshold: t.discountThreshold != null ? String(t.discountThreshold) : '',
      discountAmount: t.discountAmount != null ? String(t.discountAmount) : '',
    };
  };

  const setEdit = (t: TableRow, field: 'hourlyRate' | 'discountThreshold' | 'discountAmount', value: string) => {
    const current = getEdit(t);
    setEdits((prev) => ({
      ...prev,
      [t._id]: {
        ...current,
        [field]: value,
      },
    }));
  };

  const handleSave = async (t: TableRow) => {
    const e = getEdit(t);
    const payload: { hourlyRate?: number | null; discountThreshold?: number | null; discountAmount?: number | null } = {};
    if (e.hourlyRate.trim() !== '') {
      const v = Number(e.hourlyRate);
      if (Number.isFinite(v) && v >= 0) payload.hourlyRate = v;
      else payload.hourlyRate = null;
    } else payload.hourlyRate = null;
    if (e.discountThreshold.trim() !== '') {
      const v = Number(e.discountThreshold);
      if (Number.isFinite(v) && v >= 0) payload.discountThreshold = v;
      else payload.discountThreshold = null;
    } else payload.discountThreshold = null;
    if (e.discountAmount.trim() !== '') {
      const v = Number(e.discountAmount);
      if (Number.isFinite(v) && v >= 0) payload.discountAmount = v;
      else payload.discountAmount = null;
    } else payload.discountAmount = null;

    try {
      setSavingId(t._id);
      const token = localStorage.getItem('token');
      await api.patch(`/tables/${t._id}/rate-offer`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Table ${t.tableNumber} rate/offer updated`);
      await loadTables();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  const defaultRate = (capacity: number) => getHourlyRate(capacity);
  const defaultThreshold = (capacity: number) => getDefaultThreshold(capacity);

  /* ─── capacity section badge ─── */
  const getSectionBadge = (capacity: number): React.CSSProperties => {
    if (capacity >= 8)
      return { background: 'rgba(200,151,42,0.15)', color: '#f0c060', border: '1px solid rgba(200,151,42,0.4)', borderRadius: '999px', padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const };
    if (capacity >= 4)
      return { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.35)', borderRadius: '999px', padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const };
    return { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '999px', padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const };
  };

  const getSectionLabel = (capacity: number) => {
    if (capacity >= 8) return 'Large';
    if (capacity >= 4) return 'Medium';
    return 'Small';
  };

  const inputStyle: React.CSSProperties = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: 10,
    padding: '6px 10px',
    color: '#f8f4ed',
    outline: 'none',
    width: '7rem',
  };

  return (
    <div style={{ background: '#080808', minHeight: '100%', padding: '24px', maxWidth: '1100px' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <IndianRupee className="w-8 h-8" style={{ color: '#c8972a' }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed', letterSpacing: '0.01em' }}>
              Table Rates &amp; Offers
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#a89070' }}>
              Set hourly booking rate and discount offer per table. Leave blank to use default by capacity.
            </p>
          </div>
        </div>
        <Link
          href="/admin/tables"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(200,151,42,0.08)',
            border: '1px solid rgba(200,151,42,0.35)',
            borderRadius: '10px',
            padding: '8px 16px',
            color: '#f0c060',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200,151,42,0.16)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(200,151,42,0.08)')}
        >
          <LayoutGrid className="w-4 h-4" />
          Manage Tables
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#c8972a' }} />
        </div>
      ) : tables.length === 0 ? (
        <div
          className="rounded-lg p-8 text-center"
          style={{
            background: '#141414',
            border: '1px solid rgba(200,151,42,0.15)',
            color: '#a89070',
          }}
        >
          <p>
            No tables found. Create tables from the Bookings page first (Initialize tables).
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: '#141414',
            border: '1px solid rgba(200,151,42,0.13)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(200,151,42,0.22)',
                    background: '#1c1c1c',
                  }}
                >
                  {['Table', 'Capacity', 'Section', 'Rate (₹/hr)', 'Order Reaches (₹)', 'Discount (₹)', 'Save'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-bold"
                      style={{
                        color: '#c8972a',
                        fontSize: 11,
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tables.map((t, idx) => {
                  const e = getEdit(t);
                  const defR = defaultRate(t.capacity);
                  const defTh = defaultThreshold(t.capacity);
                  return (
                    <tr
                      key={t._id}
                      style={{
                        background: idx % 2 === 0 ? '#141414' : '#181818',
                        borderBottom: '1px solid rgba(200,151,42,0.07)',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = '#1c1c1c')}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = idx % 2 === 0 ? '#141414' : '#181818')}
                    >
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: '#f8f4ed' }}
                      >
                        {t.tableNumber}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#a89070' }}>
                        {t.capacity}
                      </td>
                      <td className="px-4 py-3">
                        <span style={getSectionBadge(t.capacity)}>
                          {getSectionLabel(t.capacity)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step={50}
                          placeholder={`Default: ${defR}`}
                          value={e.hourlyRate}
                          onChange={(ev) => setEdit(t, 'hourlyRate', ev.target.value)}
                          style={inputStyle}
                          onFocus={(ev) => (ev.currentTarget.style.borderColor = '#c8972a')}
                          onBlur={(ev) => (ev.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          placeholder={`Default: ${defTh}`}
                          value={e.discountThreshold}
                          onChange={(ev) => setEdit(t, 'discountThreshold', ev.target.value)}
                          style={inputStyle}
                          onFocus={(ev) => (ev.currentTarget.style.borderColor = '#c8972a')}
                          onBlur={(ev) => (ev.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step={50}
                          placeholder={`Default: ${defR}`}
                          value={e.discountAmount}
                          onChange={(ev) => setEdit(t, 'discountAmount', ev.target.value)}
                          style={inputStyle}
                          onFocus={(ev) => (ev.currentTarget.style.borderColor = '#c8972a')}
                          onBlur={(ev) => (ev.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleSave(t)}
                          disabled={savingId === t._id}
                          style={{
                            background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                            color: '#080808',
                            border: 'none',
                            borderRadius: 10,
                            padding: '6px 14px',
                            fontWeight: 700,
                            fontSize: 13,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: savingId === t._id ? 'not-allowed' : 'pointer',
                            opacity: savingId === t._id ? 0.6 : 1,
                            transition: 'opacity 0.15s',
                          }}
                        >
                          {savingId === t._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className="px-4 py-3 flex items-center gap-2 text-sm"
            style={{
              background: 'rgba(200,151,42,0.04)',
              borderTop: '1px solid rgba(200,151,42,0.13)',
              color: '#a89070',
            }}
          >
            <BadgePercent className="w-4 h-4" style={{ color: '#c8972a' }} />
            <span>
              Offer: when the customer&apos;s order total reaches the &quot;order reaches&quot; amount, they get the &quot;discount&quot; amount off (e.g. 1 hour free).
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Save, Loader2, BadgePercent } from 'lucide-react';
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

  return (
    <div className="p-6 max-w-5xl">
      <Toaster position="top-right" />
      <div className="flex items-center gap-2 mb-6">
        <IndianRupee className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Table rates & offers</h1>
          <p className="text-sm text-gray-400">
            Set hourly booking rate and discount offer per table. Leave blank to use default by capacity.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-gray-800/80 border border-gray-600 rounded-lg p-8 text-center text-gray-400">
          <p>No tables found. Create tables from the Bookings page first (Initialize tables).
          </p>
        </div>
      ) : (
        <div className="bg-gray-800/90 border border-gray-600 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600 bg-gray-700/50">
                  <th className="px-4 py-3 text-gray-300 font-semibold">Table</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">Capacity</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">
                    Rate (₹/hour)
                  </th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">
                    Offer: order reaches (₹)
                  </th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">
                    Offer: discount (₹)
                  </th>
                  <th className="px-4 py-3 text-gray-300 font-semibold w-24">Save</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((t) => {
                  const e = getEdit(t);
                  const defR = defaultRate(t.capacity);
                  const defTh = defaultThreshold(t.capacity);
                  return (
                    <tr key={t._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-white">{t.tableNumber}</td>
                      <td className="px-4 py-3 text-gray-300">{t.capacity}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step={50}
                          placeholder={`Default: ${defR}`}
                          value={e.hourlyRate}
                          onChange={(ev) => setEdit(t, 'hourlyRate', ev.target.value)}
                          className="w-28 px-2 py-1.5 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500"
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
                          className="w-28 px-2 py-1.5 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500"
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
                          className="w-28 px-2 py-1.5 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleSave(t)}
                          disabled={savingId === t._id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium disabled:opacity-50"
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
          <div className="px-4 py-3 bg-gray-700/30 border-t border-gray-600 flex items-center gap-2 text-sm text-gray-400">
            <BadgePercent className="w-4 h-4" />
            <span>
              Offer: when the customer&apos;s order total reaches the &quot;order reaches&quot; amount, they get the &quot;discount&quot; amount off (e.g. 1 hour free).
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

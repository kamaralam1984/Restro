'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Bug, CheckCircle, Search, RefreshCcw, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';

type ErrorStatus = 'open' | 'investigating' | 'resolved';

interface ErrorLog {
  _id: string;
  level: 'error' | 'warn';
  message: string;
  statusCode?: number;
  route?: string;
  method?: string;
  userId?: string;
  restaurantId?: string;
  stack?: string;
  status: ErrorStatus;
  createdAt: string;
}

export default function ErrorControlPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ErrorStatus | 'all'>('open');
  const [selected, setSelected] = useState<ErrorLog | null>(null);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanSummary, setLastScanSummary] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await api.get<ErrorLog[]>('/super-admin/error-logs', { params });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load error logs:', err);
      toast.error(err?.message || 'Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id: string, status: ErrorStatus) => {
    try {
      const updated = await api.patch<ErrorLog>(`/super-admin/error-logs/${id}/status`, { status });
      setLogs((prev) => prev.map((l) => (l._id === id ? { ...l, status: updated.status } : l)));
      if (selected && selected._id === id) setSelected({ ...selected, status: updated.status });
      toast.success(`Error marked as ${status}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.message.toLowerCase().includes(q) ||
      (l.route || '').toLowerCase().includes(q) ||
      (l.stack || '').toLowerCase().includes(q)
    );
  });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f8f4ed' }}>
            <Bug className="w-6 h-6" style={{ color: '#ef4444' }} />
            Error &amp; Bug Control
          </h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>
            Central view of backend errors and auto health checks. Use this to investigate and repair issues for all restaurants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-60"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.3)',
              color: '#f8f4ed',
            }}
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            disabled={scanning}
            onClick={async () => {
              try {
                setScanning(true);
                const data = await api.post<{
                  repairApplied: boolean;
                  totalRestaurants: number;
                  results: Array<{
                    restaurantId: string;
                    name: string;
                    slug: string;
                    menuCount: number;
                    tableCount: number;
                    heroImageCount: number;
                    fixedMenu: boolean;
                    fixedTables: boolean;
                    fixedHeroImages: boolean;
                  }>;
                }>('/super-admin/system/scan-repair', { repair: true });
                const fixedRestaurants = data.results.filter(
                  (r) => r.fixedMenu || r.fixedTables || r.fixedHeroImages
                );
                const summary = `Scanned ${data.totalRestaurants} restaurants. Auto-repaired ${fixedRestaurants.length} restaurant(s) with missing menu/tables.`;
                setLastScanSummary(summary);
                toast.success('Scan & repair completed');
              } catch (err: any) {
                toast.error(err?.message || 'Scan & repair failed');
              } finally {
                setScanning(false);
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-60"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#ef4444',
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            {scanning ? 'Scanning…' : 'Scan & Auto‑repair'}
          </button>
        </div>
      </div>

      {/* Filters + last scan summary */}
      <div
        className="rounded-xl p-4 flex flex-wrap gap-3 items-center"
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#f8f4ed' }}>Status:</span>
          {(['all', 'open', 'investigating', 'resolved'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s as any)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={
                statusFilter === s
                  ? {
                      background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                      color: '#080808',
                      border: 'none',
                    }
                  : {
                      background: '#1c1c1c',
                      color: '#a89070',
                      border: '1px solid rgba(200,151,42,0.2)',
                    }
              }
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by message, route or stack..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              color: '#f8f4ed',
              outline: 'none',
            }}
          />
        </div>
      </div>
      {lastScanSummary && (
        <div
          className="rounded-xl px-4 py-3 text-xs flex items-center gap-2"
          style={{
            background: '#141414',
            border: '1px solid rgba(200,151,42,0.15)',
            color: '#f8f4ed',
          }}
        >
          <ShieldCheck className="w-4 h-4" style={{ color: '#22c55e' }} />
          <span>{lastScanSummary}</span>
        </div>
      )}

      {/* Grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{
            background: '#141414',
            border: '1px solid rgba(200,151,42,0.15)',
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
          >
            <h2 className="text-sm font-semibold" style={{ color: '#f8f4ed' }}>Recent errors</h2>
            <span className="text-xs" style={{ color: '#a89070' }}>
              {loading ? 'Loading…' : `${filteredLogs.length} item${filteredLogs.length === 1 ? '' : 's'}`}
            </span>
          </div>
          {loading ? (
            <div className="p-6 text-sm" style={{ color: '#a89070' }}>Loading error logs…</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-6 text-sm" style={{ color: '#a89070' }}>No errors found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead style={{ background: '#1c1c1c' }}>
                  <tr>
                    <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Time</th>
                    <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Route</th>
                    <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Message</th>
                    <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Status</th>
                    <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>HTTP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l, idx) => (
                    <tr
                      key={l._id}
                      onClick={() => setSelected(l)}
                      className="cursor-pointer"
                      style={{
                        borderBottom: '1px solid rgba(200,151,42,0.08)',
                        background: selected?._id === l._id
                          ? '#1c1c1c'
                          : idx % 2 === 0 ? '#141414' : '#1a1a1a',
                      }}
                    >
                      <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#f8f4ed' }}>
                        {formatDateTime(l.createdAt)}
                      </td>
                      <td className="px-3 py-2 max-w-[180px] truncate" style={{ color: '#a89070' }} title={l.route}>
                        {l.method} {l.route}
                      </td>
                      <td className="px-3 py-2 max-w-[240px] truncate" style={{ color: '#f8f4ed' }} title={l.message}>
                        {l.message}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={
                            l.status === 'resolved'
                              ? {
                                  background: 'rgba(34,197,94,0.1)',
                                  color: '#22c55e',
                                  border: '1px solid rgba(34,197,94,0.3)',
                                }
                              : l.status === 'investigating'
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
                          {l.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2" style={{ color: '#a89070' }}>
                        {l.statusCode ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={
                              l.statusCode >= 500
                                ? {
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                  }
                                : {
                                    background: 'rgba(240,192,96,0.1)',
                                    color: '#f0c060',
                                    border: '1px solid rgba(240,192,96,0.3)',
                                  }
                            }
                          >
                            {l.statusCode}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: '#141414',
            border: '1px solid rgba(200,151,42,0.15)',
          }}
        >
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#f8f4ed' }}>
            {selected
              ? <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />
              : <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />}
            {selected ? 'Error details' : 'No error selected'}
          </h2>
          {selected ? (
            <>
              <div className="text-xs" style={{ color: '#a89070' }}>
                <div>
                  <span className="font-semibold" style={{ color: '#f8f4ed' }}>Time:</span> {formatDateTime(selected.createdAt)}
                </div>
                <div className="mt-1">
                  <span className="font-semibold" style={{ color: '#f8f4ed' }}>Route:</span> {selected.method} {selected.route}
                </div>
                {selected.statusCode && (
                  <div className="mt-1">
                    <span className="font-semibold" style={{ color: '#f8f4ed' }}>HTTP status:</span> {selected.statusCode}
                  </div>
                )}
                {selected.restaurantId && (
                  <div className="mt-1">
                    <span className="font-semibold" style={{ color: '#f8f4ed' }}>Restaurant ID:</span> {selected.restaurantId}
                  </div>
                )}
                {selected.userId && (
                  <div className="mt-1">
                    <span className="font-semibold" style={{ color: '#f8f4ed' }}>User ID:</span> {selected.userId}
                  </div>
                )}
              </div>

              <div className="mt-2">
                <p className="text-xs font-semibold mb-1" style={{ color: '#a89070' }}>Message</p>
                <p
                  className="text-xs rounded-md p-2"
                  style={{
                    color: '#ef4444',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  {selected.message}
                </p>
              </div>

              {selected.stack && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1" style={{ color: '#a89070' }}>Stack trace</p>
                  <pre
                    className="text-[10px] rounded-md p-2 max-h-56 overflow-auto whitespace-pre-wrap"
                    style={{
                      color: '#f8f4ed',
                      background: '#0d0d0d',
                      border: '1px solid rgba(200,151,42,0.15)',
                    }}
                  >
                    {selected.stack}
                  </pre>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => updateStatus(selected._id, 'investigating')}
                  disabled={selected.status === 'investigating'}
                  className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-60"
                  style={{
                    background: 'rgba(240,192,96,0.1)',
                    border: '1px solid rgba(240,192,96,0.3)',
                    color: '#f0c060',
                  }}
                >
                  Mark as Investigating
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(selected._id, 'resolved')}
                  disabled={selected.status === 'resolved'}
                  className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-60"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    color: '#22c55e',
                  }}
                >
                  Mark as Resolved
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs" style={{ color: '#a89070' }}>
              Select any error from the list to see full details and update its status.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

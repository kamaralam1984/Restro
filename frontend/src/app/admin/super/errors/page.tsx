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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bug className="w-6 h-6 text-red-400" />
            Error &amp; Bug Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Central view of backend errors and auto health checks. Use this to investigate and repair issues for all restaurants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold disabled:opacity-60"
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
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4" />
            {scanning ? 'Scanning…' : 'Scan & Auto‑repair'}
          </button>
        </div>
      </div>

      {/* Filters + last scan summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Status:</span>
          {(['all', 'open', 'investigating', 'resolved'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                statusFilter === s
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by message, route or stack..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 text-slate-100 rounded-lg border border-slate-700 text-xs"
          />
        </div>
      </div>
      {lastScanSummary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lastScanSummary}</span>
        </div>
      )}

      {/* Grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Recent errors</h2>
            <span className="text-xs text-slate-400">
              {loading ? 'Loading…' : `${filteredLogs.length} item${filteredLogs.length === 1 ? '' : 's'}`}
            </span>
          </div>
          {loading ? (
            <div className="p-6 text-slate-400 text-sm">Loading error logs…</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm">No errors found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-slate-300">Time</th>
                    <th className="px-3 py-2 text-left text-slate-300">Route</th>
                    <th className="px-3 py-2 text-left text-slate-300">Message</th>
                    <th className="px-3 py-2 text-left text-slate-300">Status</th>
                    <th className="px-3 py-2 text-left text-slate-300">HTTP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l) => (
                    <tr
                      key={l._id}
                      onClick={() => setSelected(l)}
                      className={`border-b border-slate-800 cursor-pointer ${
                        selected?._id === l._id ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <td className="px-3 py-2 text-slate-200 whitespace-nowrap">
                        {formatDateTime(l.createdAt)}
                      </td>
                      <td className="px-3 py-2 text-slate-300 max-w-[180px] truncate" title={l.route}>
                        {l.method} {l.route}
                      </td>
                      <td className="px-3 py-2 text-slate-200 max-w-[240px] truncate" title={l.message}>
                        {l.message}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            l.status === 'resolved'
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/60'
                              : l.status === 'investigating'
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/60'
                                : 'bg-red-600/20 text-red-300 border border-red-600/60'
                          }`}
                        >
                          {l.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {l.statusCode ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              l.statusCode >= 500
                                ? 'bg-red-600/20 text-red-300 border border-red-600/60'
                                : 'bg-amber-500/20 text-amber-200 border border-amber-500/60'
                            }`}
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
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            {selected ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {selected ? 'Error details' : 'No error selected'}
          </h2>
          {selected ? (
            <>
              <div className="text-xs text-slate-400">
                <div>
                  <span className="font-semibold text-slate-200">Time:</span> {formatDateTime(selected.createdAt)}
                </div>
                <div className="mt-1">
                  <span className="font-semibold text-slate-200">Route:</span> {selected.method} {selected.route}
                </div>
                {selected.statusCode && (
                  <div className="mt-1">
                    <span className="font-semibold text-slate-200">HTTP status:</span> {selected.statusCode}
                  </div>
                )}
                {selected.restaurantId && (
                  <div className="mt-1">
                    <span className="font-semibold text-slate-200">Restaurant ID:</span> {selected.restaurantId}
                  </div>
                )}
                {selected.userId && (
                  <div className="mt-1">
                    <span className="font-semibold text-slate-200">User ID:</span> {selected.userId}
                  </div>
                )}
              </div>

              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-300 mb-1">Message</p>
                <p className="text-xs text-red-200 bg-red-900/20 border border-red-800/60 rounded-md p-2">
                  {selected.message}
                </p>
              </div>

              {selected.stack && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-slate-300 mb-1">Stack trace</p>
                  <pre className="text-[10px] text-slate-200 bg-slate-950/80 border border-slate-800 rounded-md p-2 max-h-56 overflow-auto whitespace-pre-wrap">
                    {selected.stack}
                  </pre>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => updateStatus(selected._id, 'investigating')}
                  disabled={selected.status === 'investigating'}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold border border-amber-500/60 disabled:opacity-60"
                >
                  Mark as Investigating
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(selected._id, 'resolved')}
                  disabled={selected.status === 'resolved'}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 text-[11px] font-semibold border border-emerald-600/60 disabled:opacity-60"
                >
                  Mark as Resolved
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              Select any error from the list to see full details and update its status.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


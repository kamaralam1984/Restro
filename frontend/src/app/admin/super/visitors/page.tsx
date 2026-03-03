'use client';

import { useEffect, useState } from 'react';
import { Search, Mail } from 'lucide-react';
import api from '@/services/api';

interface PageView {
  path: string;
  visits: number;
  totalDurationSec: number;
  lastVisitedAt: string;
}

interface VisitorRow {
  _id: string;
  sessionId: string;
  name?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalDurationSec: number;
  pageViews?: PageView[];
}

const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

export default function SuperAdminVisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadVisitors = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const data = await api.get<{ visitors: VisitorRow[] }>('/super-admin/visitors', {
        headers: headers(),
        params,
      });
      setVisitors(Array.isArray((data as any).visitors) ? (data as any).visitors : []);
    } catch {
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadVisitors().catch(() => setLoading(false));
  }, [search]);

  const handleSendInfo = async (id: string) => {
    setSendingId(id);
    try {
      await api.post(`/super-admin/visitors/${id}/send-info`, {}, { headers: headers() });
      alert('Visitor info email sent.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Visitors</h1>
        <p className="text-slate-400 text-sm mt-1">
          See who is visiting the platform, from where, and how long they stay.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-left">
              <tr>
                <th className="py-4 px-5 text-slate-300 font-semibold">Visitor</th>
                <th className="py-4 px-5 text-slate-300 font-semibold">Location</th>
                <th className="py-4 px-5 text-slate-300 font-semibold">Activity</th>
                <th className="py-4 px-5 text-slate-300 font-semibold">Last Seen</th>
                <th className="py-4 px-5 text-slate-300 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No visitors tracked yet.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => {
                  const pages = v.pageViews || [];
                  const pagesCount = pages.length;
                  const topPage = pages.sort(
                    (a, b) => (b.totalDurationSec || 0) - (a.totalDurationSec || 0)
                  )[0];
                  const location = [v.city, v.state, v.country].filter(Boolean).join(', ') || 'Unknown';

                  return (
                    <tr key={v._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-300 font-semibold">
                            {(v.name || 'V').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {v.name || v.email || v.sessionId.slice(0, 8)}
                            </div>
                            <div className="text-slate-500 text-xs">
                              {v.email || `ID: ${v.sessionId.slice(0, 10)}…`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-300 text-xs">{location}</td>
                      <td className="py-4 px-5 text-slate-300 text-xs">
                        <div>Total time: {formatDuration(v.totalDurationSec)}</div>
                        <div>
                          Pages: {pagesCount}
                          {topPage ? ` • Top: ${topPage.path}` : ''}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {new Date(v.lastSeenAt).toLocaleString('en-IN')}
                        {v.timezone ? ` • ${v.timezone}` : ''}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          disabled={!v.email || sendingId === v._id}
                          onClick={() => handleSendInfo(v._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 text-xs hover:bg-purple-600/80 hover:text-white disabled:opacity-40 transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          {sendingId === v._id ? 'Sending…' : 'Send Info'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


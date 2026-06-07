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
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Visitors</h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>
          See who is visiting the platform, from where, and how long they stay.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
          <input
            type="text"
            placeholder="Search by name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              padding: '10px 14px 10px 40px',
              color: '#f8f4ed',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="animate-spin rounded-full h-10 w-10 border-2"
            style={{ borderColor: 'rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
          />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}>
          <table className="w-full text-sm">
            <thead className="text-left" style={{ background: '#1c1c1c' }}>
              <tr>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Visitor</th>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Location</th>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Activity</th>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Last Seen</th>
                <th className="py-4 px-5 font-semibold text-right" style={{ color: '#a89070' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center" style={{ color: '#a89070' }}>
                    No visitors tracked yet.
                  </td>
                </tr>
              ) : (
                visitors.map((v, idx) => {
                  const pages = v.pageViews || [];
                  const pagesCount = pages.length;
                  const topPage = pages.sort(
                    (a, b) => (b.totalDurationSec || 0) - (a.totalDurationSec || 0)
                  )[0];
                  const location = [v.city, v.state, v.country].filter(Boolean).join(', ') || 'Unknown';

                  return (
                    <tr
                      key={v._id}
                      style={{
                        background: idx % 2 === 0 ? '#141414' : '#1a1a1a',
                        borderBottom: '1px solid rgba(200,151,42,0.08)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(200,151,42,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#141414' : '#1a1a1a';
                      }}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold"
                            style={{
                              background: 'rgba(200,151,42,0.15)',
                              color: '#c8972a',
                            }}
                          >
                            {(v.name || 'V').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: '#f8f4ed' }}>
                              {v.name || v.email || v.sessionId.slice(0, 8)}
                            </div>
                            <div className="text-xs" style={{ color: '#6b5040' }}>
                              {v.email || `ID: ${v.sessionId.slice(0, 10)}…`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs" style={{ color: '#a89070' }}>{location}</td>
                      <td className="py-4 px-5 text-xs" style={{ color: '#a89070' }}>
                        <div>Total time: {formatDuration(v.totalDurationSec)}</div>
                        <div>
                          Pages: {pagesCount}
                          {topPage ? ` • Top: ${topPage.path}` : ''}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs" style={{ color: '#6b5040' }}>
                        {new Date(v.lastSeenAt).toLocaleString('en-IN')}
                        {v.timezone ? ` • ${v.timezone}` : ''}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          disabled={!v.email || sendingId === v._id}
                          onClick={() => handleSendInfo(v._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                          style={{
                            background: '#1c1c1c',
                            color: '#c8972a',
                            border: '1px solid rgba(200,151,42,0.3)',
                            opacity: (!v.email || sendingId === v._id) ? 0.4 : 1,
                            cursor: (!v.email || sendingId === v._id) ? 'not-allowed' : 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            if (v.email && sendingId !== v._id) {
                              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)';
                              (e.currentTarget as HTMLButtonElement).style.color = '#080808';
                              (e.currentTarget as HTMLButtonElement).style.border = 'none';
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1c';
                            (e.currentTarget as HTMLButtonElement).style.color = '#c8972a';
                            (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(200,151,42,0.3)';
                          }}
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

'use client';

import { useEffect, useState } from 'react';
import { Download, Upload, AlertTriangle, Database, Shield, Copy } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface BackupRestaurant {
  _id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
}

export default function SuperBackupPage() {
  const [scope, setScope] = useState<'all' | 'restaurant'>('all');
  const [restaurantId, setRestaurantId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [restaurants, setRestaurants] = useState<BackupRestaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await api.get<{ restaurants: BackupRestaurant[] }>('/super-admin/restaurants?limit=100');
        setRestaurants(Array.isArray((data as any).restaurants) ? (data as any).restaurants : []);
      } catch (err) {
        console.error('Failed to load restaurants for backup page:', err);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    load();
  }, []);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Session expired. Please login again.');
        return;
      }

      const params = new URLSearchParams();
      params.set('scope', scope);
      if (scope === 'restaurant' && restaurantId) {
        params.set('restaurantId', restaurantId);
      }

      const res = await fetch(`${API_BASE_URL}/super-admin/backup?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to export backup');
      }

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      a.href = href;
      a.download = `restro-os-backup-${scope}-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
      toast.success('Backup downloaded');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download backup');
    } finally {
      setDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a backup JSON file first');
      return;
    }
    try {
      setImporting(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('Session expired. Please login again.');
        return;
      }

      const text = await file.text();
      const payload = JSON.parse(text);

      const params = new URLSearchParams();
      if (dryRun) params.set('dryRun', 'true');

      const res = await fetch(`${API_BASE_URL}/super-admin/backup/import?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to import backup');
      }

      toast.success(data?.message || (dryRun ? 'Dry run successful' : 'Backup imported successfully'));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to import backup');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f8f4ed' }}>
            <Database className="w-6 h-6" style={{ color: '#c8972a' }} />
            Backup & Restore
          </h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>
            Super Admin tools to export full platform backups or restore from JSON. Use carefully.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: 'rgba(200,151,42,0.08)',
            border: '1px solid rgba(200,151,42,0.3)',
            color: '#f0c060',
          }}
        >
          <Shield className="w-3.5 h-3.5" />
          Super Admin only
        </div>
      </div>

      {/* Export section */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}
      >
        <h2 className="text-sm font-semibold mb-1" style={{ color: '#f8f4ed' }}>Export backup</h2>
        <p className="text-xs mb-2" style={{ color: '#a89070' }}>
          Choose whether you want a full platform backup or a single restaurant backup.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => setScope('all')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={
              scope === 'all'
                ? {
                    background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                    color: '#080808',
                    border: 'none',
                  }
                : {
                    background: '#1c1c1c',
                    color: '#f8f4ed',
                    border: '1px solid rgba(200,151,42,0.2)',
                  }
            }
          >
            Full platform
          </button>
          <button
            type="button"
            onClick={() => setScope('restaurant')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={
              scope === 'restaurant'
                ? {
                    background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                    color: '#080808',
                    border: 'none',
                  }
                : {
                    background: '#1c1c1c',
                    color: '#f8f4ed',
                    border: '1px solid rgba(200,151,42,0.2)',
                  }
            }
          >
            Single restaurant
          </button>

          {scope === 'restaurant' && (
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="Restaurant ID (Mongo ObjectId)"
              className="text-xs min-w-[260px]"
              style={{
                background: '#1c1c1c',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#f8f4ed',
                outline: 'none',
              }}
            />
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || (scope === 'restaurant' && !restaurantId)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
            style={{
              background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
              color: '#080808',
              border: 'none',
            }}
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting...' : 'Download backup JSON'}
          </button>
        </div>
      </div>

      {/* Import section */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: '#141414', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{ color: '#f8f4ed' }}>Import / Restore backup</h2>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <AlertTriangle className="w-3 h-3" />
            Dangerous
          </span>
        </div>
        <p className="text-xs" style={{ color: '#a89070' }}>
          Use this only when you are sure. Start with a{' '}
          <span className="font-semibold" style={{ color: '#ef4444' }}>dry run</span>{' '}
          to validate the file before actually writing to the database.
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="file"
            accept="application/json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs"
            style={{ color: '#f8f4ed' }}
          />

          <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: '#a89070' }}>
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="mr-1"
            />
            Dry run only (no write)
          </label>

          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !file}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.4)',
            }}
          >
            <Upload className="w-4 h-4" />
            {importing ? (dryRun ? 'Simulating...' : 'Restoring...') : dryRun ? 'Run dry import' : 'Restore backup'}
          </button>
        </div>
      </div>

      {/* Restaurant IDs helper grid */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: '#f8f4ed' }}>Restaurants &amp; IDs (for backup / restore)</h2>
        <p className="text-xs" style={{ color: '#a89070' }}>
          Use this table to quickly copy a restaurant&apos;s ID. Click &quot;Use for backup&quot; to fill the ID above.
        </p>
        {loadingRestaurants ? (
          <div className="py-6 text-sm" style={{ color: '#a89070' }}>Loading restaurants…</div>
        ) : restaurants.length === 0 ? (
          <div className="py-6 text-sm" style={{ color: '#a89070' }}>No restaurants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead style={{ background: '#1c1c1c' }}>
                <tr>
                  <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Name</th>
                  <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Slug</th>
                  <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Restaurant ID</th>
                  <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Status</th>
                  <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Subscription</th>
                  <th className="px-3 py-2 text-left" style={{ color: '#a89070' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r, idx) => (
                  <tr
                    key={r._id}
                    style={{
                      background: idx % 2 === 0 ? '#141414' : '#1a1a1a',
                      borderBottom: '1px solid rgba(200,151,42,0.08)',
                    }}
                  >
                    <td className="px-3 py-2" style={{ color: '#f8f4ed' }}>{r.name}</td>
                    <td className="px-3 py-2" style={{ color: '#a89070' }}>/{r.slug}</td>
                    <td className="px-3 py-2 font-mono text-[11px]" style={{ color: '#f8f4ed' }}>{r._id}</td>
                    <td className="px-3 py-2 capitalize" style={{ color: '#f8f4ed' }}>{r.status}</td>
                    <td className="px-3 py-2 capitalize" style={{ color: '#f8f4ed' }}>{r.subscriptionStatus}</td>
                    <td className="px-3 py-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard
                            ?.writeText(r._id)
                            .then(() => {
                              setCopiedId(r._id);
                              setTimeout(() => setCopiedId(null), 2000);
                            })
                            .catch(() => {});
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                        style={{
                          background: '#1c1c1c',
                          color: '#f8f4ed',
                          border: '1px solid rgba(200,151,42,0.2)',
                        }}
                      >
                        <Copy className="w-3 h-3" />
                        {copiedId === r._id ? 'Copied' : 'Copy ID'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setScope('restaurant');
                          setRestaurantId(r._id);
                          toast.success('Restaurant ID selected for backup');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px]"
                        style={{
                          background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                          color: '#080808',
                          border: 'none',
                        }}
                      >
                        Use for backup
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

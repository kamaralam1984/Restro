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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            Backup & Restore
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Super Admin tools to export full platform backups or restore from JSON. Use carefully.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/60 text-xs text-purple-200">
          <Shield className="w-3.5 h-3.5" />
          Super Admin only
        </div>
      </div>

      {/* Export section */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">Export backup</h2>
        <p className="text-xs text-slate-400 mb-2">
          Choose whether you want a full platform backup or a single restaurant backup.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              scope === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            Full platform
          </button>
          <button
            type="button"
            onClick={() => setScope('restaurant')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              scope === 'restaurant'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            Single restaurant
          </button>

          {scope === 'restaurant' && (
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="Restaurant ID (Mongo ObjectId)"
              className="px-3 py-1.5 bg-slate-800 text-white rounded border border-slate-700 text-xs min-w-[260px]"
            />
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || (scope === 'restaurant' && !restaurantId)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting...' : 'Download backup JSON'}
          </button>
        </div>
      </div>

      {/* Import section */}
      <div className="bg-slate-900 rounded-xl border border-red-800/60 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Import / Restore backup</h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 text-[10px] font-semibold border border-red-700/70">
            <AlertTriangle className="w-3 h-3" />
            Dangerous
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Use this only when you are sure. Start with a <span className="font-semibold text-red-300">dry run</span>{' '}
          to validate the file before actually writing to the database.
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="file"
            accept="application/json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-slate-200"
          />

          <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
          >
            <Upload className="w-4 h-4" />
            {importing ? (dryRun ? 'Simulating...' : 'Restoring...') : dryRun ? 'Run dry import' : 'Restore backup'}
          </button>
        </div>
      </div>

      {/* Restaurant IDs helper grid */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Restaurants &amp; IDs (for backup / restore)</h2>
        <p className="text-xs text-slate-400">
          Use this table to quickly copy a restaurant&apos;s ID. Click &quot;Use for backup&quot; to fill the ID above.
        </p>
        {loadingRestaurants ? (
          <div className="py-6 text-slate-400 text-sm">Loading restaurants…</div>
        ) : restaurants.length === 0 ? (
          <div className="py-6 text-slate-400 text-sm">No restaurants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-300">Name</th>
                  <th className="px-3 py-2 text-left text-slate-300">Slug</th>
                  <th className="px-3 py-2 text-left text-slate-300">Restaurant ID</th>
                  <th className="px-3 py-2 text-left text-slate-300">Status</th>
                  <th className="px-3 py-2 text-left text-slate-300">Subscription</th>
                  <th className="px-3 py-2 text-left text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r._id} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="px-3 py-2 text-slate-100">{r.name}</td>
                    <td className="px-3 py-2 text-slate-300">/{r.slug}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-200">{r._id}</td>
                    <td className="px-3 py-2 text-slate-200 capitalize">{r.status}</td>
                    <td className="px-3 py-2 text-slate-200 capitalize">{r.subscriptionStatus}</td>
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
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
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
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-[11px]"
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


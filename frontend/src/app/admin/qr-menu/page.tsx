'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/services/api';

// ─── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg: '#080808',
  card: '#141414',
  cardHover: '#181818',
  input: '#1c1c1c',
  gold: '#c8972a',
  goldLight: '#f0c060',
  text: '#f8f4ed',
  muted: '#a89070',
  border: 'rgba(200,151,42,0.15)',
  borderHover: 'rgba(200,151,42,0.35)',
};

const goldGradient = `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`;

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TableData {
  _id: string;
  tableNumber: string;
  capacity: number;
  section?: string;
  status?: string;
}

interface RestaurantInfo {
  slug: string;
  name: string;
}

// ─── QR URL builder ────────────────────────────────────────────────────────────
function buildQrUrl(slug: string, tableNumber: string): string {
  return `http://localhost:3010/qr/${slug}/${encodeURIComponent(tableNumber)}`;
}

// ─── QR Image URL (external API fallback display) ──────────────────────────────
function buildQrImageApiUrl(slug: string, tableNumber: string): string {
  const data = encodeURIComponent(buildQrUrl(slug, tableNumber));
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ width, height }: { width: string | number; height: string | number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// ─── Table QR Card ─────────────────────────────────────────────────────────────
function TableQRCard({ table, slug }: { table: TableData; slug: string }) {
  const [copied, setCopied] = useState(false);
  const qrUrl = buildQrUrl(slug, table.tableNumber);
  const qrImageApiUrl = buildQrImageApiUrl(slug, table.tableNumber);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = qrUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    window.open(qrImageApiUrl, '_blank');
  };

  const sectionLabel = table.section
    ? table.section.charAt(0).toUpperCase() + table.section.slice(1)
    : '';

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = T.borderHover;
        (e.currentTarget as HTMLDivElement).style.background = T.cardHover;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = T.border;
        (e.currentTarget as HTMLDivElement).style.background = T.card;
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span
            style={{
              background: goldGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            Table {table.tableNumber}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ color: T.muted, fontSize: 13 }}>
            {table.capacity} seats
          </span>
          {sectionLabel && (
            <>
              <span style={{ color: T.border, fontSize: 12 }}>•</span>
              <span style={{ color: T.muted, fontSize: 13 }}>{sectionLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* QR Code */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 12,
          display: 'inline-flex',
          boxShadow: '0 4px 24px rgba(200,151,42,0.12)',
        }}
      >
        <QRCodeSVG
          value={qrUrl}
          size={160}
          bgColor="#ffffff"
          fgColor="#080808"
          level="M"
        />
      </div>

      {/* URL text */}
      <div
        style={{
          background: T.input,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <p
          style={{
            color: T.muted,
            fontSize: 11,
            wordBreak: 'break-all',
            margin: 0,
            fontFamily: 'monospace',
            lineHeight: 1.5,
          }}
        >
          {qrUrl}
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <button
          onClick={handleDownload}
          style={{
            flex: 1,
            background: goldGradient,
            color: '#080808',
            border: 'none',
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          Download
        </button>
        <button
          onClick={handleCopyLink}
          style={{
            flex: 1,
            background: 'transparent',
            color: copied ? '#22c55e' : T.gold,
            border: `1px solid ${copied ? '#22c55e' : T.border}`,
            borderRadius: 8,
            padding: '9px 12px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}

// ─── Print All QRs ─────────────────────────────────────────────────────────────
function handlePrintAll(tables: TableData[], slug: string) {
  const items = tables
    .map(table => {
      const qrUrl = buildQrUrl(slug, table.tableNumber);
      const imgUrl = buildQrImageApiUrl(slug, table.tableNumber);
      return `
        <div class="qr-item">
          <h2>Table ${table.tableNumber}</h2>
          <p>${table.capacity} seats${table.section ? ` &bull; ${table.section}` : ''}</p>
          <img src="${imgUrl}" width="180" height="180" alt="QR Table ${table.tableNumber}" />
          <p class="url">${qrUrl}</p>
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>QR Codes - All Tables</title>
      <style>
        body { font-family: Georgia, serif; background: #fff; margin: 0; padding: 20px; }
        h1 { text-align: center; font-size: 24px; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .qr-item { border: 1px solid #ddd; border-radius: 12px; padding: 20px; text-align: center; page-break-inside: avoid; }
        .qr-item h2 { margin: 0 0 4px; font-size: 18px; }
        .qr-item p { margin: 0 0 12px; font-size: 13px; color: #666; }
        .qr-item img { display: block; margin: 0 auto 12px; }
        .url { font-family: monospace; font-size: 10px; word-break: break-all; color: #888; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>QR Codes — All Tables</h1>
      <div class="grid">${items}</div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 800);
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function QRMenuPage() {
  const router = useRouter();
  const [tables, setTables] = useState<TableData[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch restaurant info and tables in parallel
      const [restData, tablesRes] = await Promise.all([
        api.get<any>('/restaurants/me', { headers }),
        api.get<any>('/tables', { headers }),
      ]);

      const slug = restData?.slug || restData?.data?.slug || '';
      const name = restData?.name || restData?.data?.name || 'Restaurant';
      setRestaurant({ slug, name });

      const rawTables: TableData[] = Array.isArray(tablesRes)
        ? tablesRes
        : Array.isArray(tablesRes?.data)
        ? tablesRes.data
        : Array.isArray(tablesRes?.tables)
        ? tablesRes.tables
        : [];

      setTables(rawTables);
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTables = tables.filter(t =>
    t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.section || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Render: loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', padding: '32px 24px' }}>
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Skeleton width={280} height={40} />
          <div style={{ marginTop: 8 }}><Skeleton width={200} height={20} /></div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
              marginTop: 40,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="100%" height={340} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render: error ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          background: T.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: 16, marginBottom: 16 }}>{error}</p>
          <button
            onClick={loadData}
            style={{
              background: goldGradient,
              color: '#080808',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render: no tables ────────────────────────────────────────────────────────
  if (tables.length === 0) {
    return (
      <div
        style={{
          background: T.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(200,151,42,0.1)',
              border: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 32,
            }}
          >
            &#9635;
          </div>
          <h2
            style={{
              background: goldGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            No Tables Found
          </h2>
          <p style={{ color: T.muted, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Create tables first to generate QR codes for your customers.
          </p>
          <Link
            href="/admin/tables"
            style={{
              background: goldGradient,
              color: '#080808',
              borderRadius: 10,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Create Tables
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: main ─────────────────────────────────────────────────────────────
  const slug = restaurant?.slug || '';

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '32px 24px' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Page header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                background: goldGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 30,
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              QR Code Manager
            </h1>
            <p style={{ color: T.muted, fontSize: 14, marginTop: 6, marginBottom: 0 }}>
              {restaurant?.name} &mdash; {tables.length} table{tables.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: T.input,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: '9px 14px',
                color: T.text,
                fontSize: 14,
                outline: 'none',
                width: 200,
              }}
            />
            <button
              onClick={() => handlePrintAll(tables, slug)}
              style={{
                background: 'transparent',
                color: T.gold,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = T.gold;
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,151,42,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = T.border;
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              Print All QRs
            </button>
          </div>
        </div>

        {/* Slug info banner */}
        {slug && (
          <div
            style={{
              background: 'rgba(200,151,42,0.06)',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: T.muted, fontSize: 13 }}>Restaurant slug:</span>
            <code
              style={{
                background: T.input,
                color: T.gold,
                borderRadius: 5,
                padding: '2px 8px',
                fontSize: 13,
                fontFamily: 'monospace',
              }}
            >
              {slug}
            </code>
            <span style={{ color: T.muted, fontSize: 13 }}>
              &mdash; QR URLs follow{' '}
              <code
                style={{
                  background: T.input,
                  color: T.muted,
                  borderRadius: 5,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                /qr/{slug}/&#123;tableNumber&#125;
              </code>
            </span>
          </div>
        )}

        {/* No results after search */}
        {filteredTables.length === 0 && searchQuery && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: T.muted, fontSize: 15 }}>
              No tables match &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {filteredTables.map(table => (
            <TableQRCard key={table._id} table={table} slug={slug} />
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            color: T.muted,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 40,
            opacity: 0.6,
          }}
        >
          Customers scan the QR code and land on the order page for their table — no login required.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, MapPin } from 'lucide-react';
import api from '@/services/api';

const CARD       = '#141414';
const CARD_DARK  = '#0d0d0d';
const GOLD       = '#c8972a';
const GOLD_LIGHT = '#f0c060';
const TEXT       = '#f8f4ed';
const MUTED      = '#a89070';
const BORDER     = 'rgba(200,151,42,0.15)';
const BORDER_MID = 'rgba(200,151,42,0.30)';
const BORDER_STR = 'rgba(200,151,42,0.55)';

interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'booked' | 'reserved' | 'maintenance';
  location: { row: number; column: number; section: string };
  hourlyRate?: number;
  discountThreshold?: number;
  discountAmount?: number;
}

interface TableLayoutProps {
  selectedDate: string;
  selectedTime: string;
  numberOfGuests: number;
  onTableSelect: (table: Table) => void;
  selectedTable?: string;
  restaurantSlug?: string;
}

type Status = 'available' | 'booked' | 'maintenance' | 'too-small';

const SECTION_META: Record<string, { emoji: string; label: string; accent: string }> = {
  window:       { emoji: '🪟', label: 'Window Side',  accent: 'rgba(99,179,237,0.12)'  },
  center:       { emoji: '🍽️', label: 'Centre Hall',  accent: 'rgba(200,151,42,0.06)'  },
  centre:       { emoji: '🍽️', label: 'Centre Hall',  accent: 'rgba(200,151,42,0.06)'  },
  corner:       { emoji: '🔲', label: 'Corner Zone',  accent: 'rgba(168,144,112,0.08)' },
  outdoor:      { emoji: '🌿', label: 'Outdoor',      accent: 'rgba(74,222,128,0.07)'  },
  other:        { emoji: '🪑', label: 'Other',        accent: 'rgba(200,151,42,0.04)'  },
};

const getSectionMeta = (section: string) => {
  const key = section.toLowerCase().trim();
  return SECTION_META[key] ?? { emoji: '🪑', label: section.charAt(0).toUpperCase() + section.slice(1), accent: 'rgba(200,151,42,0.04)' };
};

/* ── Status styling lookup ─────────────────────────────────────────────────── */
const STATUS_STYLE: Record<Status, { bg: string; border: string; text: string; label: string; opacity: number }> = {
  available:   { bg: CARD,      border: BORDER_MID,                   text: TEXT,      label: '',        opacity: 1   },
  booked:      { bg: '#1a0808', border: 'rgba(239,68,68,0.35)',        text: '#f87171', label: 'BOOKED',  opacity: 0.65 },
  maintenance: { bg: '#161616', border: 'rgba(120,120,120,0.25)',      text: '#6b7280', label: 'MAINT.',  opacity: 0.5  },
  'too-small': { bg: '#141408', border: 'rgba(234,179,8,0.30)',        text: '#fbbf24', label: '',        opacity: 0.75 },
};

export default function TableLayout({
  selectedDate, selectedTime, numberOfGuests,
  onTableSelect, selectedTable, restaurantSlug,
}: TableLayoutProps) {
  const [tables,       setTables]       = useState<Table[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [hoveredId,    setHoveredId]    = useState<string | null>(null);
  const [tooltipTable, setTooltipTable] = useState<Table | null>(null);

  useEffect(() => {
    if (selectedDate && selectedTime) loadTables();
    else { setTables([]); setLoading(false); }
  }, [selectedDate, selectedTime, numberOfGuests]);

  const loadTables = async () => {
    setLoading(true);
    try {
      const slug = restaurantSlug || process.env.NEXT_PUBLIC_RESTAURANT_SLUG || 'spice-garden';
      const params: Record<string, string> = { date: selectedDate, time: selectedTime, restaurant: slug };
      let data: Table[];
      try {
        data = await api.get<Table[]>('/tables', { params });
      } catch {
        data = await api.get<Table[]>('/tables', { params: { restaurant: slug } });
      }
      setTables(Array.isArray(data) ? data : []);
    } catch {
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (t: Table): Status => {
    if (t.status === 'booked' || t.status === 'reserved') return 'booked';
    if (t.status === 'maintenance') return 'maintenance';
    if (t.capacity < numberOfGuests) return 'too-small';
    return 'available';
  };

  /* ── Group + sort by section ──────────────────────────────────────────────── */
  const bySection = tables.reduce<Record<string, Table[]>>((acc, t) => {
    const s = t.location?.section || 'center';
    (acc[s] = acc[s] || []).push(t);
    return acc;
  }, {});

  /* ── Empty / loading states ───────────────────────────────────────────────── */
  if (!selectedDate || !selectedTime) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: MUTED }}>
        <MapPin size={32} style={{ margin: '0 auto 12px', color: GOLD, opacity: 0.5 }} />
        <p>Select date &amp; time to view the floor plan</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 40, height: 40, margin: '0 auto 14px', border: `2px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <p style={{ color: MUTED, fontSize: 14 }}>Loading floor plan…</p>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(200,151,42,0.04)', border: `1px solid ${BORDER_MID}`, borderRadius: 12 }}>
        <p style={{ color: GOLD_LIGHT, fontWeight: 700, marginBottom: 6 }}>No tables available</p>
        <p style={{ color: MUTED, fontSize: 13 }}>This restaurant hasn't set up table booking yet.</p>
        <p style={{ color: `${GOLD}66`, fontSize: 12, marginTop: 6 }}>{selectedDate} · {selectedTime}</p>
      </div>
    );
  }

  /* ── Available count ──────────────────────────────────────────────────────── */
  const availableCount = tables.filter(t => getStatus(t) === 'available').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stats bar ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: MUTED }}>{tables.length} total tables</span>
        <span style={{ width: 1, height: 14, background: BORDER_MID, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: '#4ade80' }}>✓ {availableCount} available</span>
        <span style={{ width: 1, height: 14, background: BORDER_MID, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: MUTED }}>for {numberOfGuests} guest{numberOfGuests > 1 ? 's' : ''}</span>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '10px 16px', background: '#0f0f0f', borderRadius: 10, border: `1px solid ${BORDER}`, alignItems: 'center' }}>
        <span style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>Legend:</span>
        {[
          { label: 'Available',    bg: CARD,      border: BORDER_MID,                 dot: GOLD          },
          { label: 'Selected',     bg: 'rgba(200,151,42,0.18)', border: GOLD,         dot: GOLD_LIGHT    },
          { label: 'Booked',       bg: '#1a0808', border: 'rgba(239,68,68,0.35)',      dot: '#f87171'     },
          { label: 'Too Small',    bg: '#141408', border: 'rgba(234,179,8,0.30)',      dot: '#fbbf24'     },
          { label: 'Maintenance',  bg: '#161616', border: 'rgba(120,120,120,0.25)',    dot: '#6b7280'     },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: l.bg, border: `1.5px solid ${l.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.dot }} />
            </div>
            <span style={{ color: MUTED, fontSize: 12 }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── ENTRANCE bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${BORDER_MID})` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 20px', background: 'rgba(200,151,42,0.07)', border: `1px solid ${BORDER_MID}`, borderRadius: 8 }}>
          <span style={{ fontSize: 16 }}>🚪</span>
          <span style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase' }}>ENTRANCE</span>
        </div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${BORDER_MID})` }} />
      </div>

      {/* ── Sections ── */}
      {Object.entries(bySection).map(([section, sectionTables]) => {
        const meta = getSectionMeta(section);

        /* build row/col grid */
        const rows = [...new Set(sectionTables.map(t => t.location?.row ?? 1))].sort((a, b) => a - b);
        const cols = [...new Set(sectionTables.map(t => t.location?.column ?? 1))].sort((a, b) => a - b);
        const tMap: Record<string, Table> = {};
        sectionTables.forEach(t => { tMap[`${t.location?.row}_${t.location?.column}`] = t; });

        const availInSection = sectionTables.filter(t => getStatus(t) === 'available').length;

        return (
          <div
            key={section}
            style={{
              background: CARD_DARK,
              border: `1px solid ${BORDER_MID}`,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 20px',
              background: meta.accent,
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontSize: 20 }}>{meta.emoji}</span>
              <span style={{ color: GOLD_LIGHT, fontWeight: 700, fontSize: 15 }}>{meta.label}</span>
              <span style={{ marginLeft: 4, fontSize: 11, color: MUTED, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 20, border: `1px solid ${BORDER}` }}>
                {sectionTables.length} tables
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
                {availInSection} free
              </span>
            </div>

            {/* Floor grid */}
            <div style={{ padding: '20px', overflowX: 'auto' }}>
              {/* Column headers */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 8, marginLeft: 36 }}>
                {cols.map(col => (
                  <div key={col} style={{ width: 76, textAlign: 'center', color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', flexShrink: 0 }}>
                    COL {col}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rows.map(row => (
                  <div key={row} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Row label */}
                    <div style={{ width: 26, color: MUTED, fontSize: 11, fontWeight: 700, textAlign: 'center', flexShrink: 0, letterSpacing: '0.05em' }}>
                      R{row}
                    </div>

                    {cols.map(col => {
                      const table = tMap[`${row}_${col}`];
                      /* empty gap cell */
                      if (!table) return <div key={col} style={{ width: 76, height: 76, flexShrink: 0 }} />;

                      const status   = getStatus(table);
                      const ss       = STATUS_STYLE[status];
                      const isSel    = selectedTable === table.tableNumber;
                      const isHov    = hoveredId === table._id;
                      const canClick = status === 'available';

                      return (
                        <motion.button
                          key={table._id}
                          type="button"
                          disabled={!canClick}
                          onClick={() => canClick && onTableSelect(table)}
                          onMouseEnter={() => { setHoveredId(table._id); setTooltipTable(table); }}
                          onMouseLeave={() => { setHoveredId(null); setTooltipTable(null); }}
                          animate={{
                            scale:     isSel ? 1.06 : 1,
                            boxShadow: isSel
                              ? '0 0 22px rgba(200,151,42,0.6), 0 0 8px rgba(200,151,42,0.3)'
                              : isHov && canClick
                                ? '0 0 16px rgba(200,151,42,0.28)'
                                : 'none',
                          }}
                          whileTap={canClick ? { scale: 0.92 } : {}}
                          transition={{ duration: 0.18 }}
                          style={{
                            width: 76,
                            height: 76,
                            flexShrink: 0,
                            borderRadius: 12,
                            border: `1.5px solid ${isSel ? GOLD : isHov && canClick ? BORDER_STR : ss.border}`,
                            background: isSel ? 'rgba(200,151,42,0.18)' : ss.bg,
                            opacity: ss.opacity,
                            cursor: canClick ? 'pointer' : 'not-allowed',
                            outline: 'none',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            transition: 'border-color 0.18s, background 0.18s',
                          }}
                        >
                          {/* gold ring on selected */}
                          {isSel && (
                            <span style={{
                              position: 'absolute', inset: -3,
                              borderRadius: 14,
                              border: `2px solid ${GOLD}`,
                              boxShadow: `0 0 14px rgba(200,151,42,0.55)`,
                              pointerEvents: 'none',
                            }} />
                          )}

                          {/* Table number */}
                          <span style={{
                            color: isSel ? GOLD_LIGHT : ss.text,
                            fontWeight: 900,
                            fontSize: 15,
                            lineHeight: 1,
                            letterSpacing: '-0.01em',
                          }}>
                            {table.tableNumber}
                          </span>

                          {/* Capacity */}
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: isSel ? GOLD : MUTED, fontSize: 11 }}>
                            <Users size={10} />
                            {table.capacity}
                          </span>

                          {/* Status / price label */}
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.2,
                            color: isSel ? GOLD_LIGHT
                              : status === 'booked' ? '#f87171'
                              : status === 'maintenance' ? '#9ca3af'
                              : status === 'too-small' ? '#fbbf24'
                              : table.hourlyRate ? `${GOLD}bb` : 'transparent',
                          }}>
                            {isSel ? '✓ SELECTED'
                              : status === 'booked' ? 'BOOKED'
                              : status === 'maintenance' ? 'MAINT.'
                              : status === 'too-small' ? `MAX ${table.capacity}`
                              : table.hourlyRate ? `₹${table.hourlyRate}/hr`
                              : ''}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── KITCHEN bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${BORDER})` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 20px', background: 'rgba(200,151,42,0.04)', border: `1px solid ${BORDER}`, borderRadius: 8 }}>
          <span style={{ fontSize: 16 }}>🍳</span>
          <span style={{ color: MUTED, fontSize: 11, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase' }}>KITCHEN</span>
        </div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${BORDER})` }} />
      </div>

      {/* ── Floating tooltip ── */}
      <AnimatePresence>
        {tooltipTable && hoveredId && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 9999,
              background: '#1a1a1a',
              border: `1px solid ${BORDER_MID}`,
              borderRadius: 12,
              padding: '14px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              minWidth: 180,
              pointerEvents: 'none',
            }}
          >
            <p style={{ color: GOLD_LIGHT, fontWeight: 800, fontSize: 16, margin: '0 0 6px' }}>
              Table {tooltipTable.tableNumber}
            </p>
            <p style={{ color: MUTED, fontSize: 12, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Users size={12} /> Capacity: {tooltipTable.capacity} persons
            </p>
            <p style={{ color: MUTED, fontSize: 12, margin: '0 0 4px' }}>
              📍 {getSectionMeta(tooltipTable.location?.section).label} — Row {tooltipTable.location?.row}, Col {tooltipTable.location?.column}
            </p>
            {tooltipTable.hourlyRate != null && (
              <p style={{ color: GOLD, fontSize: 13, fontWeight: 700, margin: '6px 0 0' }}>
                ₹{tooltipTable.hourlyRate}/hour
              </p>
            )}
            {tooltipTable.discountThreshold && tooltipTable.discountAmount && (
              <p style={{ color: '#4ade80', fontSize: 11, margin: '4px 0 0' }}>
                🎁 Order ₹{tooltipTable.discountThreshold}+ → ₹{tooltipTable.discountAmount} OFF
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

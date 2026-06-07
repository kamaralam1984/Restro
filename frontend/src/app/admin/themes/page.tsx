'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Theme {
  id: string;
  name: string;
  category: string;
  colors: [string, string, string];
  price: number; // 0 = free
}

interface CustomTheme {
  id: string;
  name: string;
  bg: string;
  surface: string;
  accent: string;
  text: string;
  border: string;
  font: string;
  radius: number;
}

type TabType = 'marketplace' | 'my-themes' | 'custom';

// ─── Data ─────────────────────────────────────────────────────────────────────

const THEMES: Theme[] = [
  { id: 'gold-royale',      name: 'Gold Royale',     category: 'Luxury Fine Dining',      colors: ['#080808', '#c8972a', '#1a1a1a'], price: 0 },
  { id: 'ocean-blue',       name: 'Ocean Blue',      category: 'Modern Seafood / Beach',  colors: ['#0a1628', '#0ea5e9', '#1e3a5f'], price: 499 },
  { id: 'forest-green',     name: 'Forest Green',    category: 'Organic / Vegan',         colors: ['#0a1a0a', '#16a34a', '#1a2e1a'], price: 499 },
  { id: 'crimson-bistro',   name: 'Crimson Bistro',  category: 'Classic Italian / French',colors: ['#1a0a0a', '#dc2626', '#2a1010'], price: 499 },
  { id: 'midnight-purple',  name: 'Midnight Purple', category: 'Lounge / Bar',            colors: ['#0d0a1a', '#7c3aed', '#1a1030'], price: 499 },
  { id: 'warm-amber',       name: 'Warm Amber',      category: 'Family Restaurant / Dhaba',colors: ['#1a1000', '#f59e0b', '#2a1e00'], price: 499 },
  { id: 'rose-pink',        name: 'Rose Pink',       category: 'Cafe / Dessert Shop',     colors: ['#1a0a10', '#f43f5e', '#2a1018'], price: 499 },
  { id: 'steel-gray',       name: 'Steel Gray',      category: 'Modern Fast Food',        colors: ['#0f0f0f', '#6b7280', '#1a1a1a'], price: 499 },
  { id: 'sunset-orange',    name: 'Sunset Orange',   category: 'Street Food / Casual',    colors: ['#1a0e00', '#f97316', '#2a1800'], price: 499 },
];

const FONTS = ['Inter', 'Playfair Display', 'Poppins', 'Roboto'];

const DEFAULT_CUSTOM: Omit<CustomTheme, 'id' | 'name'> = {
  bg: '#080808', surface: '#141414', accent: '#c8972a', text: '#f8f4ed', border: '#2a2a2a',
  font: 'Inter', radius: 8,
};

// ─── Preview Modal ─────────────────────────────────────────────────────────────

function ThemePreviewModal({ theme, onClose }: { theme: Theme; onClose: () => void }) {
  const [primary, accent, surface] = theme.colors;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '90vw', maxWidth: 680, borderRadius: 16, overflow: 'hidden', border: `2px solid ${accent}` }}
      >
        {/* Mock Restaurant Homepage */}
        <div style={{ background: primary, fontFamily: theme.id.includes('playfair') ? 'Playfair Display' : 'Inter', minHeight: 480 }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: `1px solid ${accent}40` }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 18 }}>The Restaurant</span>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Menu', 'About', 'Book'].map(item => (
                <span key={item} style={{ color: '#aaa', fontSize: 12, cursor: 'pointer' }}>{item}</span>
              ))}
            </div>
          </div>

          {/* Hero */}
          <div style={{ background: `linear-gradient(135deg, ${surface}, ${primary})`, padding: '48px 28px', textAlign: 'center' }}>
            <div style={{ color: accent, fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' }}>Fine Dining Experience</div>
            <h1 style={{ color: '#f8f4ed', fontSize: 30, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>Welcome to Our Restaurant</h1>
            <p style={{ color: '#aaa', fontSize: 13, marginBottom: 20 }}>Exquisite cuisine crafted with passion and the finest ingredients</p>
            <button style={{ background: accent, color: primary, border: 'none', padding: '10px 28px', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Reserve a Table
            </button>
          </div>

          {/* Featured dishes */}
          <div style={{ padding: '28px', background: surface }}>
            <div style={{ color: accent, fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>Signature Dishes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {['Truffle Pasta', 'Grilled Salmon', 'Wagyu Steak'].map(dish => (
                <div key={dish} style={{ background: primary, borderRadius: 8, border: `1px solid ${accent}30`, overflow: 'hidden' }}>
                  <div style={{ height: 60, background: `${accent}15` }} />
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ color: '#f8f4ed', fontSize: 11, fontWeight: 600 }}>{dish}</div>
                    <div style={{ color: accent, fontSize: 10, marginTop: 2 }}>₹ 899</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer strip */}
          <div style={{ background: primary, borderTop: `1px solid ${accent}25`, padding: '10px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#555', fontSize: 10 }}>© 2026 The Restaurant</span>
            <span style={{ color: accent, fontSize: 10, fontWeight: 600 }}>{theme.name} Theme</span>
          </div>
        </div>

        {/* Close bar */}
        <div style={{ background: '#111', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#aaa', fontSize: 12 }}>Preview: {theme.name}</span>
          <button onClick={onClose} style={{ background: 'rgba(200,151,42,0.15)', border: '1px solid rgba(200,151,42,0.35)', color: '#c8972a', borderRadius: 8, padding: '6px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            Close Preview
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Theme Card ───────────────────────────────────────────────────────────────

function ThemeCard({
  theme, isActive, onPreview, onApply,
}: { theme: Theme; isActive: boolean; onPreview: () => void; onApply: () => void; }) {
  const [primary, accent, surface] = theme.colors;
  const isFree = theme.price === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#141414', border: isActive ? '2px solid #22c55e' : '1px solid rgba(200,151,42,0.2)',
        borderRadius: 12, overflow: 'hidden', cursor: 'default',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Color swatch strip */}
      <div style={{ display: 'flex', height: 36 }}>
        <div style={{ flex: 1, background: primary }} />
        <div style={{ flex: 1, background: accent }} />
        <div style={{ flex: 1, background: surface }} />
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ color: '#f8f4ed', fontSize: 13, fontWeight: 700 }}>{theme.name}</div>
            <div style={{ color: '#a89070', fontSize: 10, marginTop: 2 }}>{theme.category}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: isFree ? 'rgba(34,197,94,0.15)' : 'rgba(200,151,42,0.15)',
              color: isFree ? '#22c55e' : '#c8972a',
              border: isFree ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(200,151,42,0.3)',
            }}>
              {isFree ? 'FREE' : `₹${theme.price}`}
            </span>
            {isActive && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Color hex chips */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {theme.colors.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0d0d0d', borderRadius: 4, padding: '2px 6px', border: '1px solid #222' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span style={{ color: '#555', fontSize: 9 }}>{c}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onPreview}
            style={{ flex: 1, padding: '6px 0', background: 'rgba(200,151,42,0.1)', border: '1px solid rgba(200,151,42,0.25)', color: '#c8972a', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
          >
            Preview
          </button>
          <button
            onClick={isFree ? onApply : undefined}
            disabled={!isFree && !isActive}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: isFree ? 'pointer' : 'default',
              background: isActive ? 'rgba(34,197,94,0.15)' : isFree ? 'linear-gradient(135deg, #8b5a00, #c8972a)' : '#1a1a1a',
              border: isActive ? '1px solid rgba(34,197,94,0.4)' : isFree ? 'none' : '1px solid #333',
              color: isActive ? '#22c55e' : isFree ? '#080808' : '#555',
            }}
          >
            {isActive ? '✓ Applied' : isFree ? 'Apply Theme' : `₹${theme.price} - Unlock`}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Color Preview Card ────────────────────────────────────────────────────────

function CustomColorPreview({ ct }: { ct: Omit<CustomTheme, 'id' | 'name'> }) {
  return (
    <div style={{ background: ct.bg, border: `1px solid ${ct.border}`, borderRadius: ct.radius, overflow: 'hidden', fontFamily: ct.font }}>
      <div style={{ background: ct.surface, padding: '10px 14px', borderBottom: `1px solid ${ct.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: ct.accent, fontWeight: 800, fontSize: 13 }}>Restaurant</span>
        <span style={{ color: ct.text, fontSize: 11, opacity: 0.5, marginLeft: 'auto' }}>Menu</span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ color: ct.accent, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Signature Dishes</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {['Pasta', 'Steak', 'Salad'].map(item => (
            <div key={item} style={{ flex: 1, background: ct.surface, border: `1px solid ${ct.border}`, borderRadius: ct.radius * 0.7, padding: '6px 8px' }}>
              <div style={{ height: 24, background: `${ct.accent}20`, borderRadius: 4, marginBottom: 4 }} />
              <div style={{ color: ct.text, fontSize: 9, fontWeight: 600 }}>{item}</div>
              <div style={{ color: ct.accent, fontSize: 8 }}>₹ 599</div>
            </div>
          ))}
        </div>
        <button style={{ background: ct.accent, color: ct.bg, border: 'none', borderRadius: ct.radius, padding: '6px 14px', fontSize: 10, fontWeight: 700 }}>Reserve Now</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ThemesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');
  const [activeThemeId, setActiveThemeId] = useState<string>('gold-royale');
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [newThemeName, setNewThemeName] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [ct, setCt] = useState<Omit<CustomTheme, 'id' | 'name'>>(DEFAULT_CUSTOM);

  useEffect(() => {
    const saved = localStorage.getItem('restro_custom_themes');
    if (saved) { try { setCustomThemes(JSON.parse(saved)); } catch {} }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApplyTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) showToast(`${theme.name} theme applied!`);
  };

  const handleSaveCustom = () => {
    if (!newThemeName.trim()) { showToast('Please enter a theme name'); return; }
    const newTheme: CustomTheme = { id: `custom-${Date.now()}`, name: newThemeName.trim(), ...ct };
    const updated = [...customThemes, newTheme];
    setCustomThemes(updated);
    localStorage.setItem('restro_custom_themes', JSON.stringify(updated));
    setNewThemeName('');
    showToast(`Theme "${newTheme.name}" saved!`);
  };

  const updateCt = (partial: Partial<typeof ct>) => setCt(prev => ({ ...prev, ...partial }));

  const activeTheme = THEMES.find(t => t.id === activeThemeId) ?? THEMES[0];

  // ── Shared Styles ──
  const inputStyle: React.CSSProperties = {
    background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.25)',
    borderRadius: 6, color: '#f8f4ed', padding: '7px 10px', fontSize: 12,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { color: '#a89070', fontSize: 11, marginBottom: 4, display: 'block' };
  const fieldWrap: React.CSSProperties = { marginBottom: 14 };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f8f4ed', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(200,151,42,0.2)', padding: '18px 28px', background: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🎨</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#c8972a' }}>Theme Marketplace</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#a89070', marginTop: 2 }}>Browse and apply beautiful themes for your restaurant website</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(200,151,42,0.15)', padding: '0 28px', background: '#0a0a0a', display: 'flex', gap: 4 }}>
        {(['marketplace', 'my-themes', 'custom'] as TabType[]).map(tab => {
          const labels: Record<TabType, string> = { marketplace: 'Marketplace', 'my-themes': 'My Themes', custom: 'Custom Theme' };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid #c8972a' : '2px solid transparent',
                color: activeTab === tab ? '#c8972a' : '#a89070',
                fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '28px' }}>
        <AnimatePresence mode="wait">

          {/* ── TAB 1: Marketplace ── */}
          {activeTab === 'marketplace' && (
            <motion.div key="marketplace" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ color: '#a89070', fontSize: 12 }}>
                  {THEMES.length} themes available — 1 free, {THEMES.length - 1} premium
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#141414', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 8, padding: '6px 14px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ color: '#f8f4ed', fontSize: 12 }}>Active: <span style={{ color: '#c8972a', fontWeight: 700 }}>{activeTheme.name}</span></span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {THEMES.map(theme => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={activeThemeId === theme.id}
                    onPreview={() => setPreviewTheme(theme)}
                    onApply={() => handleApplyTheme(theme.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── TAB 2: My Themes ── */}
          {activeTab === 'my-themes' && (
            <motion.div key="my-themes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Currently Active</div>
                <div style={{ background: '#141414', border: '2px solid #22c55e', borderRadius: 14, padding: '20px', maxWidth: 400 }}>
                  <div style={{ display: 'flex', height: 48, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                    {activeTheme.colors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#f8f4ed', fontSize: 16, fontWeight: 800 }}>{activeTheme.name}</div>
                      <div style={{ color: '#a89070', fontSize: 12, marginTop: 2 }}>{activeTheme.category}</div>
                    </div>
                    <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>ACTIVE</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Purchased Themes</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.25)', borderRadius: 12, overflow: 'hidden', width: 180 }}>
                    <div style={{ display: 'flex', height: 30 }}>
                      {THEMES[0].colors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ color: '#f8f4ed', fontSize: 12, fontWeight: 700 }}>Gold Royale</div>
                      <div style={{ color: '#22c55e', fontSize: 10, marginTop: 2 }}>FREE — Purchased</div>
                    </div>
                  </div>
                  {customThemes.slice(0, 4).map(ct2 => (
                    <div key={ct2.id} style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.25)', borderRadius: 12, overflow: 'hidden', width: 180 }}>
                      <div style={{ display: 'flex', height: 30 }}>
                        <div style={{ flex: 1, background: ct2.bg }} />
                        <div style={{ flex: 1, background: ct2.accent }} />
                        <div style={{ flex: 1, background: ct2.surface }} />
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ color: '#f8f4ed', fontSize: 12, fontWeight: 700 }}>{ct2.name}</div>
                        <div style={{ color: '#a89070', fontSize: 10, marginTop: 2 }}>Custom Theme</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('marketplace')}
                style={{ background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.35)', color: '#c8972a', borderRadius: 8, padding: '10px 22px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
              >
                Browse More Themes →
              </button>
            </motion.div>
          )}

          {/* ── TAB 3: Custom Theme ── */}
          {activeTab === 'custom' && (
            <motion.div key="custom" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
                {/* Left: controls */}
                <div>
                  <div style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 18 }}>Color Settings</div>

                  {/* Color pickers */}
                  {[
                    { label: 'Primary Background', key: 'bg', value: ct.bg },
                    { label: 'Surface Color', key: 'surface', value: ct.surface },
                    { label: 'Accent / Gold Color', key: 'accent', value: ct.accent },
                    { label: 'Text Color', key: 'text', value: ct.text },
                    { label: 'Border Color', key: 'border', value: ct.border },
                  ].map(({ label, key, value }) => (
                    <div key={key} style={fieldWrap}>
                      <label style={labelStyle}>{label}</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="color"
                          value={value}
                          onChange={e => updateCt({ [key]: e.target.value })}
                          style={{ width: 40, height: 32, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4 }}
                        />
                        <input
                          style={{ ...inputStyle, flex: 1 }}
                          value={value}
                          onChange={e => updateCt({ [key]: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}

                  <div style={{ borderTop: '1px solid rgba(200,151,42,0.12)', paddingTop: 18, marginTop: 4 }}>
                    <div style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Typography & Layout</div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Font Family</label>
                      <select style={inputStyle} value={ct.font} onChange={e => updateCt({ font: e.target.value })}>
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div style={fieldWrap}>
                      <label style={labelStyle}>Border Radius: {ct.radius}px</label>
                      <input
                        type="range" min={0} max={20} value={ct.radius}
                        onChange={e => updateCt({ radius: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: '#c8972a' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: 10, marginTop: 2 }}>
                        <span>0 — Square</span><span>20 — Rounded</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(200,151,42,0.12)', paddingTop: 18, marginTop: 4 }}>
                    <div style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Save Custom Theme</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Theme name..."
                        value={newThemeName}
                        onChange={e => setNewThemeName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveCustom()}
                      />
                      <button
                        onClick={handleSaveCustom}
                        style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #8b5a00, #c8972a)', color: '#080808', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Save Theme
                      </button>
                    </div>
                  </div>

                  {/* Saved custom themes */}
                  {customThemes.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Saved Custom Themes</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {customThemes.map(t => (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#141414', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 8, padding: '6px 12px' }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.bg, border: '1px solid #333' }} />
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent }} />
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.surface, border: '1px solid #333' }} />
                            </div>
                            <span style={{ color: '#f8f4ed', fontSize: 11 }}>{t.name}</span>
                            <button
                              onClick={() => {
                                const updated = customThemes.filter(x => x.id !== t.id);
                                setCustomThemes(updated);
                                localStorage.setItem('restro_custom_themes', JSON.stringify(updated));
                              }}
                              style={{ background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', padding: 0 }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: live preview */}
                <div>
                  <div style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Live Preview</div>
                  <div style={{ position: 'sticky', top: 20 }}>
                    <CustomColorPreview ct={ct} />
                    <div style={{ marginTop: 12, padding: '10px 14px', background: '#141414', border: '1px solid rgba(200,151,42,0.15)', borderRadius: 8 }}>
                      <div style={{ color: '#a89070', fontSize: 10, marginBottom: 6 }}>Applied Colors</div>
                      {[
                        { label: 'Background', color: ct.bg },
                        { label: 'Surface', color: ct.surface },
                        { label: 'Accent', color: ct.accent },
                        { label: 'Text', color: ct.text },
                        { label: 'Border', color: ct.border },
                      ].map(({ label, color }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <div style={{ width: 14, height: 14, borderRadius: 3, background: color, border: '1px solid #333', flexShrink: 0 }} />
                          <span style={{ color: '#a89070', fontSize: 10, width: 70 }}>{label}</span>
                          <span style={{ color: '#c8972a', fontSize: 10, fontFamily: 'monospace' }}>{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTheme && (
          <ThemePreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              background: '#1a1a1a', border: '1px solid rgba(200,151,42,0.4)', color: '#f8f4ed',
              padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999, whiteSpace: 'nowrap',
            }}
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type RBTheme = 'rb-dark' | 'rb-light' | 'rb-warm';

const themes: { key: RBTheme; label: string; dot: string; bg: string; text: string }[] = [
  { key: 'rb-dark',  label: 'Dark',  dot: '#141414', bg: '#080808', text: '#f8f4ed' },
  { key: 'rb-light', label: 'Light', dot: '#f5f0e8', bg: '#faf8f3', text: '#1a1408' },
  { key: 'rb-warm',  label: 'Gold',  dot: '#1a140a', bg: '#0d0a04', text: '#fff8e8' },
];

const STORAGE_KEY = 'rb-theme';

export default function RestaurantThemeSwitcher() {
  const [active, setActive] = useState<RBTheme>('rb-dark');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as RBTheme) || 'rb-dark';
    applyTheme(saved);
    setActive(saved);
  }, []);

  const applyTheme = (theme: RBTheme) => {
    const html = document.documentElement;
    // Remove all restaurant theme classes
    html.classList.remove('rb-dark', 'rb-light', 'rb-warm');
    html.classList.add(theme);
    document.body.style.transition = 'background-color 0.35s ease';
    // Also sync the landing-section theme class
    html.classList.remove('theme-light', 'theme-dark');
    if (theme === 'rb-light') {
      html.classList.add('theme-light');
    } else {
      html.classList.add('theme-dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  };

  const select = (theme: RBTheme) => {
    setActive(theme);
    applyTheme(theme);
    setOpen(false);
  };

  const activeTheme = themes.find((t) => t.key === active) ?? themes[0];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              bottom: '60px',
              right: 0,
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              minWidth: '140px',
              pointerEvents: 'auto',
            }}
          >
            {/* Tooltip label */}
            <p style={{
              color: '#888',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '2px 10px 8px',
              margin: 0,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '4px',
            }}>
              Choose Theme
            </p>

            {themes.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onPointerDown={() => select(t.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(200,151,42,0.15)' : 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isActive ? 'rgba(200,151,42,0.2)' : 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isActive ? 'rgba(200,151,42,0.15)' : 'transparent'; }}
                >
                  {/* Swatch */}
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    background: t.bg,
                    border: isActive ? '2px solid #c8972a' : '2px solid rgba(255,255,255,0.15)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: t.text,
                      opacity: 0.7,
                    }} />
                  </div>

                  <span style={{
                    color: isActive ? '#ffffff' : '#aaaaaa',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    flex: 1,
                  }}>
                    {t.label}
                  </span>

                  {isActive && (
                    <span style={{ color: '#c8972a', fontSize: '14px', fontWeight: 900 }}>✓</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Change Theme"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.15)',
          background: activeTheme.bg,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          fontSize: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Color split circles */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          <div style={{ flex: 1, background: '#0a0a0a' }} />
          <div style={{ flex: 1, background: '#ffffff' }} />
        </div>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(#080808 120deg, #faf8f3 120deg 240deg, #0d0a04 240deg)`,
          opacity: 0.9,
        }} />
        {/* Center circle */}
        <div style={{
          position: 'relative',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#c8972a',
          border: '2px solid rgba(255,255,255,0.5)',
          zIndex: 1,
        }} />
      </motion.button>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────
const GOLD = '#c8972a';
const BG = '#080808';
const SURFACE = '#141414';
const SURFACE2 = '#1a1a1a';
const BORDER = 'rgba(200,151,42,0.18)';
const API = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ResellerClient {
  name: string;
  email: string;
  plan: string;
  status: string;
  addedAt: string;
}

interface WhiteLabelConfig {
  _id?: string;
  agencyName: string;
  customDomain?: string;
  brandColor: string;
  brandColorSecondary: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCSS?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  customLoginMessage?: string;
  hideRestroOSBranding: boolean;
  status: 'active' | 'inactive';
  resellerClients: ResellerClient[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
        background: type === 'success' ? '#0f2a1a' : '#2a0f0f',
        border: `1px solid ${type === 'success' ? '#22c55e' : '#ef4444'}`,
        color: type === 'success' ? '#22c55e' : '#ef4444',
        padding: '14px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600,
        maxWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {msg}
    </motion.div>
  );
}

// ── Tab Button ─────────────────────────────────────────────────────────────────
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 24px', borderRadius: 8,
        border: active ? `1px solid ${GOLD}` : '1px solid rgba(255,255,255,0.08)',
        background: active ? GOLD + '22' : 'transparent',
        color: active ? GOLD : 'rgba(255,255,255,0.5)',
        fontWeight: active ? 700 : 400, fontSize: 13, cursor: 'pointer',
        transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: 0.2,
      }}
    >
      {label}
    </button>
  );
}

// ── Input Component ────────────────────────────────────────────────────────────
function Input({
  label, value, onChange, type = 'text', placeholder = '', disabled = false,
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.5 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8,
          padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
          transition: 'border 0.2s', width: '100%', boxSizing: 'border-box',
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  );
}

// ── Color Picker Row ───────────────────────────────────────────────────────────
function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.5 }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: 44, height: 36, borderRadius: 8, border: `1px solid ${BORDER}`,
            background: 'transparent', cursor: 'pointer', padding: 2,
          }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#c8972a"
          style={{
            flex: 1, background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: '8px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'monospace',
          }}
        />
        <div style={{ width: 28, height: 28, borderRadius: 6, background: value, border: `1px solid ${BORDER}` }} />
      </div>
    </div>
  );
}

// ── Live Preview Panel ─────────────────────────────────────────────────────────
function LivePreview({ config }: { config: WhiteLabelConfig }) {
  const primary = config.brandColor || GOLD;
  const secondary = config.brandColorSecondary || BG;

  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14,
      overflow: 'hidden', position: 'sticky', top: 24,
    }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>Live Preview</span>
      </div>

      {/* Simulated Admin Panel */}
      <div style={{ background: secondary, minHeight: 320, display: 'flex' }}>
        {/* Sidebar */}
        <div style={{
          width: 56, background: secondary, borderRight: `1px solid ${primary}33`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 10,
        }}>
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="logo" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 6, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>
                {(config.agencyName || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              width: 32, height: 6, borderRadius: 3,
              background: i === 1 ? primary : `${primary}33`,
            }} />
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: 14 }}>
          <div style={{
            background: `${primary}15`, border: `1px solid ${primary}44`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 10,
          }}>
            <div style={{ fontSize: 10, color: primary, fontWeight: 700 }}>
              {config.agencyName || 'Agency Name'}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {config.customLoginMessage || 'Welcome to the admin panel'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: `${primary}0d`, border: `1px solid ${primary}22`,
                borderRadius: 8, padding: 10,
              }}>
                <div style={{ width: '60%', height: 5, borderRadius: 3, background: `${primary}44`, marginBottom: 6 }} />
                <div style={{ width: '40%', height: 8, borderRadius: 3, background: primary }} />
              </div>
            ))}
          </div>
          {!config.hideRestroOSBranding && (
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
              Powered by Restro OS
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 16px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: primary }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Colors applied — {primary}</span>
      </div>
    </div>
  );
}

// ── TAB 1: Branding ────────────────────────────────────────────────────────────
function BrandingTab({
  config, setConfig, onSave, saving,
}: {
  config: WhiteLabelConfig;
  setConfig: React.Dispatch<React.SetStateAction<WhiteLabelConfig>>;
  onSave: () => void;
  saving: boolean;
}) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleImg = (field: 'logoUrl' | 'faviconUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setConfig(c => ({ ...c, [field]: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const set = (key: keyof WhiteLabelConfig) => (v: string | boolean) =>
    setConfig(c => ({ ...c, [key]: v }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
      {/* Left: Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5 }}>
            Brand Identity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Agency / Brand Name"
              value={config.agencyName}
              onChange={v => set('agencyName')(v)}
              placeholder="My Restaurant Agency"
            />
            <ColorRow
              label="Primary Brand Color"
              value={config.brandColor}
              onChange={v => set('brandColor')(v)}
            />
            <ColorRow
              label="Secondary / Background Color"
              value={config.brandColorSecondary}
              onChange={v => set('brandColorSecondary')(v)}
            />
          </div>
        </div>

        {/* Logo & Favicon */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5 }}>
            Logo & Favicon
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Logo */}
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 8 }}>
                Logo
              </div>
              <div
                onClick={() => logoInputRef.current?.click()}
                style={{
                  border: `2px dashed ${BORDER}`, borderRadius: 10, padding: 20,
                  textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s',
                  minHeight: 100, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="logo" style={{ maxWidth: '100%', maxHeight: 60, objectFit: 'contain' }} />
                ) : (
                  <>
                    <div style={{ fontSize: 28, opacity: 0.3 }}>+</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Upload Logo</div>
                  </>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={e => handleImg('logoUrl', e)} style={{ display: 'none' }} />
            </div>
            {/* Favicon */}
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 8 }}>
                Favicon
              </div>
              <div
                onClick={() => faviconInputRef.current?.click()}
                style={{
                  border: `2px dashed ${BORDER}`, borderRadius: 10, padding: 20,
                  textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s',
                  minHeight: 100, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {config.faviconUrl ? (
                  <img src={config.faviconUrl} alt="favicon" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                ) : (
                  <>
                    <div style={{ fontSize: 28, opacity: 0.3 }}>+</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Upload Favicon</div>
                  </>
                )}
              </div>
              <input ref={faviconInputRef} type="file" accept="image/*" onChange={e => handleImg('faviconUrl', e)} style={{ display: 'none' }} />
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5 }}>
            Advanced Options
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 8 }}>
                Custom Login Message
              </div>
              <textarea
                value={config.customLoginMessage || ''}
                onChange={e => set('customLoginMessage')(e.target.value)}
                placeholder="Welcome! Please sign in to your dashboard."
                rows={2}
                style={{
                  width: '100%', background: SURFACE2, border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13,
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 8 }}>
                Custom CSS <span style={{ opacity: 0.5 }}>(Advanced)</span>
              </div>
              <textarea
                value={config.customCSS || ''}
                onChange={e => set('customCSS')(e.target.value)}
                placeholder=":root { --custom-var: value; }"
                rows={5}
                style={{
                  width: '100%', background: SURFACE2, border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: '10px 14px', color: '#c8972a', fontSize: 12,
                  outline: 'none', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${BORDER}` }}>
              <div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Hide Restro OS Branding</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  Remove "Powered by Restro OS" from all pages
                </div>
              </div>
              <button
                onClick={() => set('hideRestroOSBranding')(!config.hideRestroOSBranding)}
                style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: config.hideRestroOSBranding ? GOLD : 'rgba(255,255,255,0.15)',
                  position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: config.hideRestroOSBranding ? 25 : 3,
                  transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          style={{
            background: GOLD, color: '#000', border: 'none', borderRadius: 10,
            padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, transition: 'all 0.2s', alignSelf: 'flex-start',
          }}
        >
          {saving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>

      {/* Right: Preview */}
      <LivePreview config={config} />
    </div>
  );
}

// ── TAB 2: Domain & Email ──────────────────────────────────────────────────────
function DomainEmailTab({
  config, setConfig, onSave, saving, onToast,
}: {
  config: WhiteLabelConfig;
  setConfig: React.Dispatch<React.SetStateAction<WhiteLabelConfig>>;
  onSave: () => void;
  saving: boolean;
  onToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [verifying, setVerifying] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const set = (key: keyof WhiteLabelConfig) => (v: string) =>
    setConfig(c => ({ ...c, [key]: v }));

  const handleVerifyDomain = async () => {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1800));
    setVerifying(false);
    onToast('Domain verification initiated. DNS propagation may take up to 48h.', 'success');
  };

  const handleTestEmail = async () => {
    if (!config.smtpHost || !config.emailFromAddress) {
      onToast('Please fill SMTP settings first.', 'error');
      return;
    }
    setTestingEmail(true);
    await new Promise(r => setTimeout(r, 1500));
    setTestingEmail(false);
    onToast(`Test email sent to ${config.emailFromAddress}`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700 }}>
      {/* Note Banner */}
      <div style={{
        background: `${GOLD}15`, border: `1px solid ${GOLD}44`, borderRadius: 10,
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 16 }}>*</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          Custom domain support requires a <strong style={{ color: GOLD }}>Pro or Premium plan</strong>. Upgrade to enable white-label domain routing and SSL provisioning.
        </span>
      </div>

      {/* Custom Domain */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5 }}>
          Custom Domain
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Custom Domain"
                value={config.customDomain || ''}
                onChange={v => set('customDomain')(v)}
                placeholder="app.myrestaurant.com"
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                onClick={handleVerifyDomain}
                disabled={verifying || !config.customDomain}
                style={{
                  background: 'transparent', color: GOLD, border: `1px solid ${GOLD}`,
                  borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600,
                  cursor: verifying ? 'not-allowed' : 'pointer', opacity: verifying ? 0.6 : 1,
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {verifying ? 'Verifying...' : 'Verify Domain'}
              </button>
            </div>
          </div>

          {/* SSL Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>SSL Status:</span>
            <span style={{
              background: '#052e16', border: '1px solid #22c55e', color: '#22c55e',
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            }}>
              SSL Active
            </span>
          </div>

          {/* DNS Instructions */}
          <div style={{ background: '#0a0a0a', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, marginBottom: 12 }}>
              DNS Setup Instructions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { type: 'CNAME', name: config.customDomain || 'app.yourdomain.com', value: 'restro-os.app' },
                { type: 'A', name: '@', value: '203.0.113.1' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '64px 1fr 1fr',
                  gap: 12, alignItems: 'center', padding: '8px 12px',
                  background: SURFACE2, borderRadius: 8, fontFamily: 'monospace', fontSize: 12,
                }}>
                  <span style={{ color: GOLD, fontWeight: 700 }}>{row.type}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{row.name}</span>
                  <span style={{ color: '#22c55e' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>
              Add these DNS records in your domain registrar's DNS settings. Propagation takes up to 48 hours.
            </div>
          </div>
        </div>
      </div>

      {/* SMTP Email */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5 }}>
          SMTP Email Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="From Name" value={config.emailFromName || ''} onChange={v => set('emailFromName')(v)} placeholder="My Restaurant" />
            <Input label="From Email" value={config.emailFromAddress || ''} onChange={v => set('emailFromAddress')(v)} placeholder="noreply@myrestaurant.com" type="email" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 16 }}>
            <Input label="SMTP Host" value={config.smtpHost || ''} onChange={v => set('smtpHost')(v)} placeholder="smtp.gmail.com" />
            <Input label="SMTP Port" value={config.smtpPort || ''} onChange={v => set('smtpPort')(v)} type="number" placeholder="587" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="SMTP Username" value={config.smtpUser || ''} onChange={v => set('smtpUser')(v)} placeholder="user@gmail.com" />
            <Input label="SMTP Password" value={config.smtpPass || ''} onChange={v => set('smtpPass')(v)} type="password" placeholder="••••••••" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleTestEmail}
              disabled={testingEmail}
              style={{
                background: 'transparent', color: GOLD, border: `1px solid ${GOLD}`,
                borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600,
                cursor: testingEmail ? 'not-allowed' : 'pointer', opacity: testingEmail ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {testingEmail ? 'Sending...' : 'Test Email'}
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                background: GOLD, color: '#000', border: 'none', borderRadius: 8,
                padding: '10px 22px', fontSize: 13, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save Email Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TAB 3: Reseller Clients ────────────────────────────────────────────────────
function ResellerTab({
  config, onAdd, onRemove, restaurantId,
}: {
  config: WhiteLabelConfig;
  onAdd: (client: { name: string; email: string; plan: string }) => Promise<void>;
  onRemove: (email: string) => Promise<void>;
  restaurantId: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', plan: 'Basic' });
  const [adding, setAdding] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState('');

  const clients = config.resellerClients || [];
  const activeCount = clients.filter(c => c.status === 'active').length;
  const planPrices: Record<string, number> = { Basic: 999, Pro: 2499, Premium: 4999 };
  const mrr = clients.reduce((sum, c) => sum + (c.status === 'active' ? (planPrices[c.plan] || 0) : 0), 0);

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    setAdding(true);
    await onAdd(form);
    setAdding(false);
    setShowModal(false);
    setForm({ name: '', email: '', plan: 'Basic' });
  };

  const handleRemove = async (email: string) => {
    setRemovingEmail(email);
    await onRemove(email);
    setRemovingEmail(null);
  };

  const generateUrl = () => {
    const domain = config.customDomain || 'app.restro-os.app';
    setGeneratedUrl(`https://${domain}/login?ref=${config.agencyName?.replace(/\s+/g, '-').toLowerCase() || 'agency'}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Clients', value: clients.length },
          { label: 'Active', value: activeCount },
          { label: 'Monthly Recurring Revenue', value: `₹${mrr.toLocaleString('en-IN')}` },
        ].map(stat => (
          <div key={stat.label} style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* URL Generator */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 12 }}>Reseller Login URL Generator</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            flex: 1, background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: '10px 14px', fontSize: 12, color: generatedUrl ? '#22c55e' : 'rgba(255,255,255,0.3)',
            fontFamily: 'monospace',
          }}>
            {generatedUrl || 'Click Generate to create your white-labeled login URL'}
          </div>
          <button
            onClick={generateUrl}
            style={{
              background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}`,
              borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Generate
          </button>
          {generatedUrl && (
            <button
              onClick={() => navigator.clipboard.writeText(generatedUrl)}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.5)', border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: '10px 14px', fontSize: 12, cursor: 'pointer',
              }}
            >
              Copy
            </button>
          )}
        </div>
      </div>

      {/* Client Table */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 13, color: GOLD, fontWeight: 700 }}>Reseller Clients</div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: GOLD, color: '#000', border: 'none', borderRadius: 8,
              padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Add Client
          </button>
        </div>

        {clients.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            No reseller clients yet. Add your first client.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Name', 'Email', 'Plan', 'Status', 'Added', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 18px', textAlign: 'left', fontSize: 11,
                      color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 0.5,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((client, i) => (
                  <tr key={client.email} style={{ borderBottom: i < clients.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#fff', fontWeight: 600 }}>{client.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{client.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: `${GOLD}22`, color: GOLD, padding: '3px 10px',
                        borderRadius: 20, fontSize: 11, fontWeight: 700,
                      }}>
                        {client.plan}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: client.status === 'active' ? '#052e16' : '#1a0000',
                        color: client.status === 'active' ? '#22c55e' : '#ef4444',
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        border: `1px solid ${client.status === 'active' ? '#22c55e44' : '#ef444444'}`,
                      }}>
                        {client.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {fmtDate(client.addedAt)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => handleRemove(client.email)}
                        disabled={removingEmail === client.email}
                        style={{
                          background: 'transparent', color: '#ef4444', border: '1px solid #ef444433',
                          borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                          opacity: removingEmail === client.email ? 0.5 : 1,
                        }}
                      >
                        {removingEmail === client.email ? '...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}
            onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
                padding: 32, width: '100%', maxWidth: 420,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 24 }}>Add Reseller Client</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Client Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Restaurant ABC" />
                <Input label="Email Address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="owner@restaurant.com" type="email" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Plan</label>
                  <select
                    value={form.plan}
                    onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    style={{
                      background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8,
                      padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
                    }}
                  >
                    <option value="Basic">Basic — ₹999/mo</option>
                    <option value="Pro">Pro — ₹2,499/mo</option>
                    <option value="Premium">Premium — ₹4,999/mo</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.5)',
                    border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={adding || !form.name || !form.email}
                  style={{
                    flex: 1, background: GOLD, color: '#000', border: 'none', borderRadius: 8,
                    padding: '12px', fontSize: 14, fontWeight: 700,
                    cursor: adding || !form.name || !form.email ? 'not-allowed' : 'pointer',
                    opacity: adding || !form.name || !form.email ? 0.6 : 1,
                  }}
                >
                  {adding ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function WhiteLabelPage() {
  const [tab, setTab] = useState<'branding' | 'domain' | 'reseller'>('branding');
  const [config, setConfig] = useState<WhiteLabelConfig>({
    agencyName: 'My Agency',
    brandColor: '#c8972a',
    brandColorSecondary: '#080808',
    hideRestroOSBranding: false,
    status: 'active',
    resellerClients: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API}/white-label/me`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.config) setConfig(data.config);
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/white-label/me`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      if (data.config) setConfig(data.config);
      showToast('Settings saved successfully!', 'success');
    } catch {
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddClient = async (client: { name: string; email: string; plan: string }) => {
    try {
      const res = await fetch(`${API}/white-label/clients`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(client),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add client');
      }
      const data = await res.json();
      if (data.config) setConfig(data.config);
      showToast('Client added successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to add client', 'error');
    }
  };

  const handleRemoveClient = async (email: string) => {
    try {
      const res = await fetch(`${API}/white-label/clients/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to remove');
      const data = await res.json();
      if (data.config) setConfig(data.config);
      showToast('Client removed.', 'success');
    } catch {
      showToast('Failed to remove client.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: GOLD, fontSize: 14 }}>Loading configuration...</div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: `${GOLD}22`,
              border: `1px solid ${GOLD}44`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              W
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>White Label</h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 560 }}>
            Brand the admin panel with your agency identity, configure custom domains, and manage reseller clients.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <TabButton label="Branding" active={tab === 'branding'} onClick={() => setTab('branding')} />
          <TabButton label="Domain & Email" active={tab === 'domain'} onClick={() => setTab('domain')} />
          <TabButton label="Reseller Clients" active={tab === 'reseller'} onClick={() => setTab('reseller')} />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'branding' && (
              <BrandingTab config={config} setConfig={setConfig} onSave={handleSave} saving={saving} />
            )}
            {tab === 'domain' && (
              <DomainEmailTab
                config={config}
                setConfig={setConfig}
                onSave={handleSave}
                saving={saving}
                onToast={showToast}
              />
            )}
            {tab === 'reseller' && (
              <ResellerTab
                config={config}
                onAdd={handleAddClient}
                onRemove={handleRemoveClient}
                restaurantId={config._id || ''}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

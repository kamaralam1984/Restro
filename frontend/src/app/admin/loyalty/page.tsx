'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoyaltySettings {
  enabled: boolean;
  pointsPerRupee: number;     // e.g. 1 point per ₹10 → value = 10
  redemptionRate: number;     // e.g. 100 points = ₹10 → value = 10
  minPointsToRedeem: number;
  pointsExpiryDays: number;
  tiers: TierConfig[];
  rewards: Reward[];
}

interface TierConfig {
  name: 'Bronze' | 'Silver' | 'Gold';
  minPoints: number;
  maxPoints: number;
  multiplier: number;
  color: string;
  icon: string;
}

interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  isCustom: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'restro_loyalty_settings';
const GOLD = '#D4AF37';
const DARK_GOLD = '#B8960C';
const BG = '#0a0a0a';
const CARD_BG = '#111111';
const BORDER = '#2a2a2a';

const DEFAULT_TIERS: TierConfig[] = [
  { name: 'Bronze', minPoints: 0,    maxPoints: 999,  multiplier: 1.0, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', minPoints: 1000, maxPoints: 4999, multiplier: 1.5, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold',   minPoints: 5000, maxPoints: -1,   multiplier: 2.0, color: '#FFD700', icon: '🥇' },
];

const DEFAULT_REWARDS: Reward[] = [
  { id: 'r1', name: 'Free Dessert',    pointsCost: 500,  description: 'Redeem for a complimentary dessert', isCustom: false },
  { id: 'r2', name: '10% Off Order',   pointsCost: 1000, description: '10% discount on your next order',   isCustom: false },
  { id: 'r3', name: 'Free Delivery',   pointsCost: 300,  description: 'Waive the delivery fee on any order', isCustom: false },
];

const DEFAULT_SETTINGS: LoyaltySettings = {
  enabled: true,
  pointsPerRupee: 10,
  redemptionRate: 10,
  minPointsToRedeem: 500,
  pointsExpiryDays: 365,
  tiers: DEFAULT_TIERS,
  rewards: DEFAULT_REWARDS,
};

// ─── Analytics mock data ───────────────────────────────────────────────────────
const MOCK_ANALYTICS = [
  { label: 'Total Members',    value: '—',   icon: '👥', note: 'Connect customer database' },
  { label: 'Points Issued',    value: '—',   icon: '⭐', note: 'Connect order pipeline' },
  { label: 'Points Redeemed',  value: '—',   icon: '🔄', note: 'Connect redemption events' },
  { label: 'Redemption Rate',  value: '—',   icon: '📈', note: 'Calculated from live data' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadSettings(): LoyaltySettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<LoyaltySettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      tiers: parsed.tiers ?? DEFAULT_TIERS,
      rewards: parsed.rewards ?? DEFAULT_REWARDS,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: LoyaltySettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoyaltyPage() {
  const [settings, setSettings] = useState<LoyaltySettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [editTier, setEditTier] = useState<TierConfig | null>(null);
  const [rewardModal, setRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', pointsCost: '', description: '' });
  const [rewardError, setRewardError] = useState('');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // ── Persist & show saved toast ─────────────────────────────────────────────
  function persist(updated: LoyaltySettings) {
    setSettings(updated);
    saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // ── Toggle program ─────────────────────────────────────────────────────────
  function toggleProgram() {
    persist({ ...settings, enabled: !settings.enabled });
  }

  // ── Update numeric setting ─────────────────────────────────────────────────
  function updateNum(key: keyof LoyaltySettings, val: string) {
    const n = Number(val);
    if (isNaN(n) || n < 0) return;
    persist({ ...settings, [key]: n });
  }

  // ── Tier edit ──────────────────────────────────────────────────────────────
  function saveTier(updated: TierConfig) {
    const tiers = settings.tiers.map(t => t.name === updated.name ? updated : t);
    persist({ ...settings, tiers });
    setEditTier(null);
  }

  // ── Reward actions ─────────────────────────────────────────────────────────
  function openAddReward() {
    setEditingReward(null);
    setNewReward({ name: '', pointsCost: '', description: '' });
    setRewardError('');
    setRewardModal(true);
  }

  function openEditReward(r: Reward) {
    setEditingReward(r);
    setNewReward({ name: r.name, pointsCost: String(r.pointsCost), description: r.description });
    setRewardError('');
    setRewardModal(true);
  }

  function saveReward() {
    if (!newReward.name.trim()) return setRewardError('Name is required');
    if (!newReward.pointsCost || Number(newReward.pointsCost) <= 0) return setRewardError('Points cost must be > 0');

    let rewards: Reward[];
    if (editingReward) {
      rewards = settings.rewards.map(r =>
        r.id === editingReward.id
          ? { ...r, name: newReward.name.trim(), pointsCost: Number(newReward.pointsCost), description: newReward.description.trim() }
          : r
      );
    } else {
      const reward: Reward = {
        id: uuid(),
        name: newReward.name.trim(),
        pointsCost: Number(newReward.pointsCost),
        description: newReward.description.trim(),
        isCustom: true,
      };
      rewards = [...settings.rewards, reward];
    }
    persist({ ...settings, rewards });
    setRewardModal(false);
  }

  function deleteReward(id: string) {
    if (!confirm('Remove this reward?')) return;
    persist({ ...settings, rewards: settings.rewards.filter(r => r.id !== id) });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '32px 24px', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: GOLD, letterSpacing: '-0.5px', margin: 0 }}>
            Loyalty Program
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>Configure points, tiers, and rewards for your customers</p>
        </div>
        {saved && (
          <div style={{ background: '#052210', border: '1px solid #22c55e', borderRadius: '8px', padding: '8px 16px', color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
            ✓ Settings saved
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Program Toggle                                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Section title="Program Status" icon="🎯">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161616', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px 24px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
              {settings.enabled ? 'Loyalty Program is Active' : 'Loyalty Program is Disabled'}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {settings.enabled
                ? 'Customers earn and redeem points on every qualifying order.'
                : 'Enable to start rewarding your customers with loyalty points.'}
            </div>
          </div>
          <button
            onClick={toggleProgram}
            style={{
              width: '56px', height: '30px', borderRadius: '15px', border: 'none', cursor: 'pointer',
              background: settings.enabled ? '#22c55e' : '#444',
              position: 'relative', transition: 'background 0.25s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: '5px',
              left: settings.enabled ? '28px' : '5px',
              width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              transition: 'left 0.25s', display: 'block',
            }} />
          </button>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Program Settings                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Section title="Program Settings" icon="⚙️">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <SettingCard
            label="Points Earned per ₹ Spent"
            hint="1 point for every ₹__ spent"
            value={settings.pointsPerRupee}
            onChange={v => updateNum('pointsPerRupee', v)}
            prefix="₹"
            suffix="= 1 pt"
          />
          <SettingCard
            label="Redemption Value"
            hint="100 points = ₹__ discount"
            value={settings.redemptionRate}
            onChange={v => updateNum('redemptionRate', v)}
            prefix="100 pts ="
            suffix="₹"
            suffixAfter
          />
          <SettingCard
            label="Minimum Points to Redeem"
            hint="Minimum balance before redeeming"
            value={settings.minPointsToRedeem}
            onChange={v => updateNum('minPointsToRedeem', v)}
            suffix="pts"
            suffixAfter
          />
          <SettingCard
            label="Points Expiry"
            hint="Points expire after this many days"
            value={settings.pointsExpiryDays}
            onChange={v => updateNum('pointsExpiryDays', v)}
            suffix="days"
            suffixAfter
          />
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: Tier System                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Section title="Tier System" icon="🏆">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {settings.tiers.map(tier => (
            <TierCard key={tier.name} tier={tier} onEdit={() => setEditTier({ ...tier })} />
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Rewards Catalog                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Section title="Rewards Catalog" icon="🎁" action={
        <button
          onClick={openAddReward}
          style={{
            background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`,
            color: '#000', border: 'none', borderRadius: '8px',
            padding: '8px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
          }}
        >+ Add Reward</button>
      }>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {settings.rewards.map(reward => (
            <div key={reward.id} style={{
              background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px',
              position: 'relative',
            }}>
              {reward.isCustom && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', background: '#1a1a1a', color: '#888', borderRadius: '4px', padding: '2px 6px' }}>Custom</span>
              )}
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>🎁</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>{reward.name}</div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>{reward.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '16px', color: GOLD }}>{reward.pointsCost} <span style={{ fontWeight: 400, fontSize: '12px', color: '#888' }}>pts</span></span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => openEditReward(reward)} style={iconBtnStyle}>✏️</button>
                  <button onClick={() => deleteReward(reward.id)} style={{ ...iconBtnStyle, color: '#ef4444' }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: Analytics                                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <Section title="Analytics" icon="📊">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {MOCK_ANALYTICS.map(stat => (
            <div key={stat.label} style={{
              background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#444' }}>{stat.value}</span>
              <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>{stat.label}</span>
              <span style={{ fontSize: '11px', color: '#444', fontStyle: 'italic' }}>{stat.note}</span>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div style={{
          background: CARD_BG, border: `1px dashed ${BORDER}`, borderRadius: '12px',
          padding: '48px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📈</div>
          <div style={{ color: '#555', fontWeight: 600, fontSize: '15px' }}>Analytics coming soon</div>
          <div style={{ color: '#3a3a3a', fontSize: '13px', marginTop: '6px' }}>
            Connect the customer database and order pipeline to see live loyalty analytics
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TIER EDIT MODAL                                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {editTier && (
        <>
          <div onClick={() => setEditTier(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(3px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#0e0e0e', border: `1px solid ${BORDER}`, borderRadius: '16px',
            padding: '28px', width: '100%', maxWidth: '400px', zIndex: 50,
          }}>
            <h3 style={{ color: GOLD, margin: '0 0 20px 0', fontSize: '18px' }}>Edit {editTier.name} Tier</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ModalField label="Multiplier (e.g. 1.5 = 1.5x points)">
                <input
                  type="number" min="1" step="0.1"
                  value={editTier.multiplier}
                  onChange={e => setEditTier(t => t ? { ...t, multiplier: Number(e.target.value) } : t)}
                  style={inputStyle}
                />
              </ModalField>
              <ModalField label="Min Points">
                <input
                  type="number" min="0"
                  value={editTier.minPoints}
                  onChange={e => setEditTier(t => t ? { ...t, minPoints: Number(e.target.value) } : t)}
                  style={inputStyle}
                />
              </ModalField>
              <ModalField label="Max Points (-1 for unlimited)">
                <input
                  type="number" min="-1"
                  value={editTier.maxPoints}
                  onChange={e => setEditTier(t => t ? { ...t, maxPoints: Number(e.target.value) } : t)}
                  style={inputStyle}
                />
              </ModalField>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditTier(null)} style={{ flex: 1, background: '#1a1a1a', border: `1px solid ${BORDER}`, color: '#aaa', borderRadius: '8px', padding: '11px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => editTier && saveTier(editTier)}
                style={{ flex: 2, background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`, color: '#000', border: 'none', borderRadius: '8px', padding: '11px', fontWeight: 700, cursor: 'pointer' }}
              >Save Tier</button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* REWARD ADD/EDIT MODAL                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {rewardModal && (
        <>
          <div onClick={() => setRewardModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(3px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#0e0e0e', border: `1px solid ${BORDER}`, borderRadius: '16px',
            padding: '28px', width: '100%', maxWidth: '400px', zIndex: 50,
          }}>
            <h3 style={{ color: GOLD, margin: '0 0 20px 0', fontSize: '18px' }}>{editingReward ? 'Edit Reward' : 'Add Custom Reward'}</h3>

            {rewardError && (
              <div style={{ background: '#1a0000', border: '1px solid #ff4444', borderRadius: '8px', padding: '10px', color: '#ff6666', marginBottom: '14px', fontSize: '13px' }}>
                {rewardError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ModalField label="Reward Name *">
                <input
                  value={newReward.name}
                  onChange={e => setNewReward(r => ({ ...r, name: e.target.value }))}
                  placeholder="e.g. Free Drink"
                  style={inputStyle}
                />
              </ModalField>
              <ModalField label="Points Cost *">
                <input
                  type="number" min="1"
                  value={newReward.pointsCost}
                  onChange={e => setNewReward(r => ({ ...r, pointsCost: e.target.value }))}
                  placeholder="e.g. 500"
                  style={inputStyle}
                />
              </ModalField>
              <ModalField label="Description">
                <textarea
                  value={newReward.description}
                  onChange={e => setNewReward(r => ({ ...r, description: e.target.value }))}
                  placeholder="Short description"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </ModalField>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setRewardModal(false)} style={{ flex: 1, background: '#1a1a1a', border: `1px solid ${BORDER}`, color: '#aaa', borderRadius: '8px', padding: '11px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={saveReward}
                style={{ flex: 2, background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`, color: '#000', border: 'none', borderRadius: '8px', padding: '11px', fontWeight: 700, cursor: 'pointer' }}
              >{editingReward ? 'Update Reward' : 'Add Reward'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, icon, children, action }: { title: string; icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
          <span>{icon}</span>
          <span>{title}</span>
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function SettingCard({
  label, hint, value, onChange, prefix, suffix, suffixAfter,
}: {
  label: string; hint: string; value: number;
  onChange: (v: string) => void;
  prefix?: string; suffix?: string; suffixAfter?: boolean;
}) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ccc' }}>{label}</div>
      <div style={{ fontSize: '11px', color: '#555' }}>{hint}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
        {prefix && !suffixAfter && <span style={{ color: GOLD, fontWeight: 700, fontSize: '14px' }}>{prefix}</span>}
        <input
          type="number"
          min="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, width: '80px', textAlign: 'center', fontSize: '18px', fontWeight: 700, color: GOLD }}
        />
        {suffix && <span style={{ color: '#888', fontSize: '13px' }}>{suffix}</span>}
        {prefix && suffixAfter && <span style={{ color: GOLD, fontWeight: 700, fontSize: '14px' }}>{prefix}</span>}
      </div>
    </div>
  );
}

function TierCard({ tier, onEdit }: { tier: TierConfig; onEdit: () => void }) {
  const rangeText = tier.maxPoints === -1
    ? `${tier.minPoints.toLocaleString()}+ pts`
    : `${tier.minPoints.toLocaleString()} – ${tier.maxPoints.toLocaleString()} pts`;

  return (
    <div style={{
      background: CARD_BG,
      border: `1.5px solid ${tier.color}44`,
      borderRadius: '14px',
      padding: '22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* glow top edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>{tier.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: tier.color }}>{tier.name}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{rangeText}</div>
          </div>
        </div>
        <button
          onClick={onEdit}
          style={{ background: '#1a1a1a', border: `1px solid ${BORDER}`, color: '#888', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}
        >Edit</button>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '28px', fontWeight: 800, color: tier.color }}>{tier.multiplier}x</span>
        <span style={{ fontSize: '13px', color: '#888' }}>points multiplier</span>
      </div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#161616',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const iconBtnStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '6px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '14px',
};

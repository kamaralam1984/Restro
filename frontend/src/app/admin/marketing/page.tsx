'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignType = 'whatsapp' | 'sms' | 'email' | 'push';
type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
type TargetSegment = 'all' | 'new' | 'returning' | 'inactive' | 'vip';

interface Campaign {
  _id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetSegment: TargetSegment;
  message: string;
  subject?: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<CampaignType, { icon: string; color: string; label: string }> = {
  whatsapp: { icon: '💬', color: '#22c55e', label: 'WhatsApp' },
  sms: { icon: '📱', color: '#3b82f6', label: 'SMS' },
  email: { icon: '✉️', color: '#f59e0b', label: 'Email' },
  push: { icon: '🔔', color: '#a855f7', label: 'Push' },
};

const STATUS_CONFIG: Record<CampaignStatus, { color: string; label: string; bg: string }> = {
  draft: { color: '#888', label: 'Draft', bg: '#88888822' },
  scheduled: { color: '#3b82f6', label: 'Scheduled', bg: '#3b82f622' },
  sent: { color: '#22c55e', label: 'Sent', bg: '#22c55e22' },
  failed: { color: '#ef4444', label: 'Failed', bg: '#ef444422' },
};

const SEGMENT_CONFIG: Record<TargetSegment, { icon: string; label: string; color: string }> = {
  all: { icon: '👥', label: 'All Customers', color: '#d4af37' },
  new: { icon: '🌟', label: 'New Customers', color: '#3b82f6' },
  returning: { icon: '🔄', label: 'Returning', color: '#22c55e' },
  vip: { icon: '👑', label: 'VIP', color: '#a855f7' },
  inactive: { icon: '💤', label: 'Inactive', color: '#ef4444' },
};

const VARIABLE_HINTS = ['{name}', '{restaurant}', '{offer}', '{date}', '{amount}'];

const TEMPLATE_MESSAGES: Record<CampaignType, string> = {
  whatsapp: 'Hi {name}! 🍽️ {restaurant} has a special offer just for you: {offer}. Visit us today!',
  sms: 'Hi {name}, {restaurant} here! Exciting offer: {offer}. Valid today only. Reply STOP to opt out.',
  email: 'Dear {name},\n\nWe have an exciting offer at {restaurant}!\n\n{offer}\n\nHope to see you soon!\n\nBest regards,\n{restaurant} Team',
  push: '{restaurant}: {offer} just for you, {name}! Tap to view.',
};

// ─── Campaign Card ────────────────────────────────────────────────────────────

interface CampaignCardProps {
  campaign: Campaign;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (c: Campaign) => void;
}

function CampaignCard({ campaign, onSend, onDelete, onEdit }: CampaignCardProps) {
  const type = TYPE_CONFIG[campaign.type];
  const status = STATUS_CONFIG[campaign.status];
  const seg = SEGMENT_CONFIG[campaign.targetSegment];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: '#0d0d0d', border: '1px solid #1e1e1e',
        borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: type.color + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>{type.icon}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{campaign.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <span style={{
                background: type.color + '22', color: type.color, borderRadius: 5,
                padding: '2px 8px', fontSize: 11, fontWeight: 600,
              }}>{type.label}</span>
              <span style={{
                background: status.bg, color: status.color, borderRadius: 5,
                padding: '2px 8px', fontSize: 11, fontWeight: 600,
              }}>{status.label}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onEdit(campaign)}
            style={{ background: '#1e1e1e', border: 'none', color: '#888', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}
          >Edit</button>
          {campaign.status !== 'sent' && (
            <button
              onClick={() => onSend(campaign._id)}
              style={{ background: '#22c55e22', border: '1px solid #22c55e44', color: '#22c55e', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >Send Now</button>
          )}
          <button
            onClick={() => onDelete(campaign._id)}
            style={{ background: '#ef444422', border: '1px solid #ef444433', color: '#ef4444', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}
          >Delete</button>
        </div>
      </div>

      {/* Segment + message */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>{seg.icon}</span>
        <span style={{ color: seg.color, fontSize: 13, fontWeight: 600 }}>{seg.label}</span>
      </div>
      <div style={{
        background: '#161616', borderRadius: 8, padding: '10px 14px',
        color: '#666', fontSize: 13, lineHeight: 1.5,
        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      } as React.CSSProperties}>{campaign.message}</div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20 }}>
        {[
          { label: 'Recipients', value: campaign.recipientCount, color: '#d4af37' },
          { label: 'Delivered', value: campaign.deliveredCount, color: '#22c55e' },
          { label: 'Opened', value: campaign.openedCount, color: '#3b82f6' },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ color: s.color, fontWeight: 700, fontSize: 18 }}>{s.value}</div>
            <div style={{ color: '#444', fontSize: 11 }}>{s.label}</div>
          </div>
        ))}
        {campaign.sentAt && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ color: '#444', fontSize: 11 }}>Sent</div>
            <div style={{ color: '#666', fontSize: 12 }}>
              {new Date(campaign.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Phone Preview ────────────────────────────────────────────────────────────

function PhonePreview({ type, message, subject }: { type: CampaignType; message: string; subject?: string }) {
  const cfg = TYPE_CONFIG[type];
  const preview = message
    .replace(/\{name\}/g, 'Rahul')
    .replace(/\{restaurant\}/g, 'Spice Garden')
    .replace(/\{offer\}/g, '20% off on orders above ₹500')
    .replace(/\{date\}/g, 'today')
    .replace(/\{amount\}/g, '₹500');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px' }}>
      <div style={{ color: '#555', fontSize: 12, marginBottom: 12 }}>Preview</div>
      {/* Phone frame */}
      <div style={{
        width: 240, background: '#111', borderRadius: 32, border: '2px solid #2a2a2a',
        padding: '24px 12px', position: 'relative', boxShadow: '0 0 40px #d4af3715',
      }}>
        {/* Notch */}
        <div style={{
          width: 80, height: 10, background: '#2a2a2a', borderRadius: 5,
          margin: '0 auto 16px',
        }} />
        {/* App bar */}
        <div style={{
          background: cfg.color + '22', borderRadius: 10, padding: '8px 12px',
          marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>{cfg.icon}</span>
          <span style={{ color: cfg.color, fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>
        </div>
        {/* Message bubble */}
        <div style={{
          background: '#1e1e1e', borderRadius: '4px 14px 14px 14px',
          padding: '10px 12px', fontSize: 12, color: '#ddd', lineHeight: 1.6,
          marginBottom: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {type === 'email' && subject && (
            <div style={{ color: '#d4af37', fontWeight: 700, marginBottom: 6, fontSize: 11 }}>
              Subject: {subject}
            </div>
          )}
          {preview}
        </div>
        <div style={{ color: '#333', fontSize: 10, textAlign: 'right' }}>Now</div>
      </div>
    </div>
  );
}

// ─── Create Campaign Form ─────────────────────────────────────────────────────

interface CreateFormProps {
  initialSegment?: TargetSegment;
  onCreated: (c: Campaign) => void;
  editingCampaign?: Campaign;
  onUpdated?: (c: Campaign) => void;
  onCancel?: () => void;
}

function CreateCampaignForm({ initialSegment, onCreated, editingCampaign, onUpdated, onCancel }: CreateFormProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(editingCampaign?.name ?? '');
  const [type, setType] = useState<CampaignType>(editingCampaign?.type ?? 'whatsapp');
  const [segment, setSegment] = useState<TargetSegment>(editingCampaign?.targetSegment ?? initialSegment ?? 'all');
  const [message, setMessage] = useState(editingCampaign?.message ?? TEMPLATE_MESSAGES.whatsapp);
  const [subject, setSubject] = useState(editingCampaign?.subject ?? '');
  const [recipientCount, setRecipientCount] = useState(editingCampaign?.recipientCount ?? 0);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!editingCampaign) setMessage(TEMPLATE_MESSAGES[type]);
  }, [type, editingCampaign]);

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#161616', border: '1px solid #2a2a2a',
    borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#666', marginBottom: 6, display: 'block', fontWeight: 600 };

  const handleSave = async (sendNow: boolean) => {
    if (!name.trim()) { toast.error('Campaign name required'); return; }
    if (!message.trim()) { toast.error('Message required'); return; }
    setSaving(true);
    try {
      const payload: any = {
        name, type, targetSegment: segment, message, subject: subject || undefined,
        recipientCount, status: 'draft',
        scheduledAt: scheduleMode === 'later' && scheduledAt ? scheduledAt : undefined,
      };

      let saved: Campaign;
      if (editingCampaign?._id) {
        saved = await api.put<Campaign>(`/crm/campaigns/${editingCampaign._id}`, payload, { headers });
        onUpdated?.(saved);
        toast.success('Campaign updated');
      } else {
        saved = await api.post<Campaign>('/crm/campaigns', payload, { headers });
        onCreated(saved);
        toast.success('Campaign saved as draft');
      }

      if (sendNow && saved._id) {
        const sent = await api.post<{ campaign: Campaign }>(`/crm/campaigns/${saved._id}/send`, {}, { headers });
        if (editingCampaign?._id) onUpdated?.(sent.campaign);
        else onCreated(sent.campaign);
        toast.success('Campaign sent!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const nextBtn: React.CSSProperties = {
    background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#000',
    border: 'none', borderRadius: 10, padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  };
  const backBtn: React.CSSProperties = {
    background: 'transparent', border: '1px solid #2a2a2a', color: '#666',
    borderRadius: 10, padding: '11px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  };

  const STEPS = ['Name', 'Type', 'Segment', 'Message', 'Schedule', 'Review'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 28 }}>
      <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 18, padding: 30 }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div
                onClick={() => i + 1 <= step && setStep(i + 1)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                  cursor: i + 1 <= step ? 'pointer' : 'default',
                  background: i + 1 === step ? 'linear-gradient(135deg, #d4af37, #f0d060)'
                    : i + 1 < step ? '#22c55e' : '#1e1e1e',
                  color: i + 1 <= step ? '#000' : '#444',
                  border: i + 1 === step ? 'none' : `1px solid ${i + 1 < step ? '#22c55e' : '#2a2a2a'}`,
                  flexShrink: 0, transition: 'all 0.2s',
                }}
              >{i + 1 < step ? '✓' : i + 1}</div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i + 1 < step ? '#22c55e33' : '#1e1e1e', margin: '0 4px' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ color: '#d4af37', fontWeight: 700, marginBottom: 4, fontSize: 13 }}>Step {step} of {STEPS.length}</div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>{STEPS[step - 1]}</div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Campaign Name</label>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Diwali Special Offer 2026"
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle}>Expected Recipients</label>
              <input
                style={inputStyle}
                type="number"
                value={recipientCount}
                onChange={(e) => setRecipientCount(Number(e.target.value))}
                placeholder="e.g. 250"
                min={0}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              {onCancel && <button style={backBtn} onClick={onCancel}>Cancel</button>}
              <button style={nextBtn} onClick={() => name.trim() && setStep(2)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 2: Type */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {(Object.keys(TYPE_CONFIG) as CampaignType[]).map((t) => {
                const cfg = TYPE_CONFIG[t];
                const active = type === t;
                return (
                  <motion.button
                    key={t}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setType(t)}
                    style={{
                      background: active ? cfg.color + '22' : '#161616',
                      border: `2px solid ${active ? cfg.color : '#2a2a2a'}`,
                      borderRadius: 14, padding: '20px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: active ? cfg.color : '#fff', fontWeight: 700, fontSize: 15 }}>{cfg.label}</div>
                      <div style={{ color: '#444', fontSize: 12 }}>
                        {t === 'whatsapp' && 'Rich messages, high open rate'}
                        {t === 'sms' && 'Universal reach, concise'}
                        {t === 'email' && 'Detailed content, attachments'}
                        {t === 'push' && 'Instant app notifications'}
                      </div>
                    </div>
                    {active && (
                      <div style={{
                        marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%',
                        background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', fontSize: 12, fontWeight: 700,
                      }}>✓</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
              <button style={backBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={nextBtn} onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Segment */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(Object.keys(SEGMENT_CONFIG) as TargetSegment[]).map((s) => {
                const cfg = SEGMENT_CONFIG[s];
                const active = segment === s;
                return (
                  <motion.button
                    key={s}
                    whileHover={{ x: 2 }}
                    onClick={() => setSegment(s)}
                    style={{
                      background: active ? cfg.color + '11' : '#161616',
                      border: `1px solid ${active ? cfg.color : '#2a2a2a'}`,
                      borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                    <span style={{ color: active ? cfg.color : '#bbb', fontWeight: active ? 700 : 500, fontSize: 15 }}>
                      {cfg.label}
                    </span>
                    {active && <span style={{ marginLeft: 'auto', color: cfg.color, fontWeight: 700 }}>✓</span>}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
              <button style={backBtn} onClick={() => setStep(2)}>← Back</button>
              <button style={nextBtn} onClick={() => setStep(4)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Message */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {type === 'email' && (
              <div>
                <label style={labelStyle}>Subject Line</label>
                <input
                  style={inputStyle}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Special offer just for you!"
                />
              </div>
            )}
            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                style={{ ...inputStyle, minHeight: 140, resize: 'vertical', lineHeight: 1.6 }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Available Variables:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {VARIABLE_HINTS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setMessage((m) => m + ' ' + v)}
                    style={{
                      background: '#d4af3722', border: '1px solid #d4af3744', color: '#d4af37',
                      borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                    }}
                  >{v}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
              <button style={backBtn} onClick={() => setStep(3)}>← Back</button>
              <button style={nextBtn} onClick={() => message.trim() && setStep(5)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 5: Schedule */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {(['now', 'later'] as const).map((mode) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setScheduleMode(mode)}
                  style={{
                    flex: 1, background: scheduleMode === mode ? '#d4af3722' : '#161616',
                    border: `2px solid ${scheduleMode === mode ? '#d4af37' : '#2a2a2a'}`,
                    borderRadius: 14, padding: '20px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{mode === 'now' ? '⚡' : '🕐'}</span>
                  <span style={{ color: scheduleMode === mode ? '#d4af37' : '#888', fontWeight: 700, fontSize: 14 }}>
                    {mode === 'now' ? 'Send Now' : 'Schedule Later'}
                  </span>
                </motion.button>
              ))}
            </div>
            {scheduleMode === 'later' && (
              <div>
                <label style={labelStyle}>Schedule Date & Time</label>
                <input
                  style={inputStyle}
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
              <button style={backBtn} onClick={() => setStep(4)}>← Back</button>
              <button style={nextBtn} onClick={() => setStep(6)}>Review →</button>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Campaign Name', value: name },
              { label: 'Type', value: TYPE_CONFIG[type].label },
              { label: 'Target Segment', value: SEGMENT_CONFIG[segment].label },
              { label: 'Recipients', value: recipientCount.toString() },
              { label: 'Schedule', value: scheduleMode === 'now' ? 'Send Immediately' : scheduledAt || 'Not set' },
            ].map((row) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                borderBottom: '1px solid #1a1a1a',
              }}>
                <span style={{ color: '#555', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ background: '#161616', borderRadius: 10, padding: '14px', marginTop: 4 }}>
              <div style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>Message Preview</div>
              <div style={{ color: '#bbb', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {message.substring(0, 200)}{message.length > 200 ? '...' : ''}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
              <button style={backBtn} onClick={() => setStep(5)}>← Back</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  style={{ ...backBtn, borderColor: '#d4af3766', color: '#d4af37' }}
                >{saving ? 'Saving...' : 'Save Draft'}</button>
                <button
                  onClick={() => handleSave(scheduleMode === 'now')}
                  disabled={saving}
                  style={{ ...nextBtn, opacity: saving ? 0.7 : 1 }}
                >{saving ? 'Sending...' : scheduleMode === 'now' ? 'Send Campaign' : 'Schedule Campaign'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PhonePreview type={type} message={message} subject={subject} />
        {/* Quick info */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 14, padding: 18 }}>
          <div style={{ color: '#d4af37', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Campaign Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>{TYPE_CONFIG[type].icon}</span>
              <span style={{ color: '#888', fontSize: 13 }}>{TYPE_CONFIG[type].label}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>{SEGMENT_CONFIG[segment].icon}</span>
              <span style={{ color: '#888', fontSize: 13 }}>{SEGMENT_CONFIG[segment].label}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>👥</span>
              <span style={{ color: '#888', fontSize: 13 }}>{recipientCount} recipients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ campaigns }: { campaigns: Campaign[] }) {
  const totalSent = campaigns.filter((c) => c.status === 'sent').length;
  const totalDelivered = campaigns.reduce((s, c) => s + c.deliveredCount, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.openedCount, 0);
  const totalRecipients = campaigns.reduce((s, c) => s + c.recipientCount, 0);
  const avgOpenRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;

  const bestCampaign = campaigns
    .filter((c) => c.deliveredCount > 0)
    .sort((a, b) => (b.openedCount / b.deliveredCount) - (a.openedCount / a.deliveredCount))[0];

  // Bar chart data by type
  const byType = (Object.keys(TYPE_CONFIG) as CampaignType[]).map((t) => ({
    type: t,
    count: campaigns.filter((c) => c.type === t).length,
    cfg: TYPE_CONFIG[t],
  }));
  const maxCount = Math.max(...byType.map((b) => b.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Sent', value: totalSent, color: '#22c55e', icon: '📤' },
          { label: 'Total Delivered', value: totalDelivered, color: '#3b82f6', icon: '✅' },
          { label: 'Avg Open Rate', value: `${avgOpenRate}%`, color: '#d4af37', icon: '👁️' },
          { label: 'Best Performing', value: bestCampaign?.name ?? '—', color: '#a855f7', icon: '🏆', small: true },
        ].map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ scale: 1.02 }}
            style={{
              background: '#0d0d0d', border: `1px solid ${s.color}33`,
              borderRadius: 16, padding: '20px 22px',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
            <div style={{
              color: s.color, fontWeight: 800,
              fontSize: s.small ? 16 : 32, marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{s.value}</div>
            <div style={{ color: '#444', fontSize: 12 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Campaigns by Channel</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 160 }}>
          {byType.map((b) => {
            const barH = maxCount > 0 ? Math.max((b.count / maxCount) * 130, b.count > 0 ? 20 : 0) : 0;
            return (
              <div key={b.type} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ color: b.cfg.color, fontSize: 14, fontWeight: 700 }}>{b.count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barH }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{
                    width: '100%', background: `linear-gradient(180deg, ${b.cfg.color}, ${b.cfg.color}66)`,
                    borderRadius: '6px 6px 0 0', minHeight: b.count > 0 ? 4 : 0,
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20 }}>{b.cfg.icon}</div>
                  <div style={{ color: '#555', fontSize: 11 }}>{b.cfg.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance table */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #1a1a1a' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Recent Campaign Performance</span>
        </div>
        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333', padding: 40 }}>No campaign data yet</div>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: 12, padding: '12px 22px', borderBottom: '1px solid #1a1a1a',
              color: '#444', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            }}>
              <span>Campaign</span><span>Type</span><span>Recipients</span>
              <span>Delivered</span><span>Opened</span><span>Open Rate</span>
            </div>
            {campaigns.slice(0, 10).map((c, i) => {
              const openRate = c.deliveredCount > 0 ? Math.round((c.openedCount / c.deliveredCount) * 100) : 0;
              const typeCfg = TYPE_CONFIG[c.type];
              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                    gap: 12, padding: '14px 22px', borderBottom: '1px solid #111',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                  <span style={{ color: typeCfg.color, fontSize: 13 }}>{typeCfg.icon} {typeCfg.label}</span>
                  <span style={{ color: '#888', fontSize: 13 }}>{c.recipientCount}</span>
                  <span style={{ color: '#888', fontSize: 13 }}>{c.deliveredCount}</span>
                  <span style={{ color: '#888', fontSize: 13 }}>{c.openedCount}</span>
                  <div>
                    <div style={{ color: openRate > 30 ? '#22c55e' : openRate > 15 ? '#f59e0b' : '#888', fontWeight: 700, fontSize: 13 }}>
                      {openRate}%
                    </div>
                    <div style={{
                      height: 3, background: '#1e1e1e', borderRadius: 2, marginTop: 4, overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${openRate}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        style={{
                          height: '100%', background: openRate > 30 ? '#22c55e' : openRate > 15 ? '#f59e0b' : '#555',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Inner Component (uses useSearchParams) ───────────────────────────────────

function MarketingInner() {
  const searchParams = useSearchParams();
  const segmentParam = searchParams.get('segment') as TargetSegment | null;

  const [tab, setTab] = useState<'campaigns' | 'create' | 'analytics'>(
    segmentParam ? 'create' : 'campaigns'
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>(undefined);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.get<Campaign[]>('/crm/campaigns', { headers });
      setCampaigns(data);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Send this campaign now?')) return;
    try {
      const res = await api.post<{ campaign: Campaign }>(`/crm/campaigns/${id}/send`, {}, { headers });
      setCampaigns((prev) => prev.map((c) => (c._id === id ? res.campaign : c)));
      toast.success('Campaign sent!');
    } catch {
      toast.error('Failed to send campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/crm/campaigns/${id}`, { headers });
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      toast.success('Campaign deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setTab('create');
  };

  const handleCreated = (c: Campaign) => {
    setCampaigns((prev) => {
      const existing = prev.find((p) => p._id === c._id);
      if (existing) return prev.map((p) => (p._id === c._id ? c : p));
      return [c, ...prev];
    });
    setEditingCampaign(undefined);
    setTab('campaigns');
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex', gap: 4, background: '#111', borderRadius: 12, padding: 4,
    marginBottom: 28, border: '1px solid #1e1e1e',
  };
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: active ? 700 : 500, fontSize: 14, transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg, #d4af37, #f0d060)' : 'transparent',
    color: active ? '#000' : '#666',
  });

  return (
    <div style={{ background: '#080808', minHeight: '100vh', padding: '28px 24px', fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #d4af37' } }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#d4af37', fontSize: 28, fontWeight: 800, margin: 0 }}>Marketing Automation</h1>
          <p style={{ color: '#555', fontSize: 14, margin: '4px 0 0' }}>Create and manage marketing campaigns</p>
        </div>
        <button
          onClick={() => { setEditingCampaign(undefined); setTab('create'); }}
          style={{
            background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#000',
            border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >+ New Campaign</button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Campaigns', value: campaigns.length, color: '#d4af37' },
          { label: 'Sent', value: campaigns.filter((c) => c.status === 'sent').length, color: '#22c55e' },
          { label: 'Scheduled', value: campaigns.filter((c) => c.status === 'scheduled').length, color: '#3b82f6' },
          { label: 'Drafts', value: campaigns.filter((c) => c.status === 'draft').length, color: '#888' },
          { label: 'Total Reached', value: campaigns.reduce((s, c) => s + c.recipientCount, 0), color: '#a855f7' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 12, padding: '14px 20px', minWidth: 120,
          }}>
            <div style={{ color: s.color, fontSize: 26, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: '#555', fontSize: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={tabBarStyle}>
        <button style={tabBtnStyle(tab === 'campaigns')} onClick={() => { setEditingCampaign(undefined); setTab('campaigns'); }}>Campaigns</button>
        <button style={tabBtnStyle(tab === 'create')} onClick={() => { setEditingCampaign(undefined); setTab('create'); }}>
          {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        </button>
        <button style={tabBtnStyle(tab === 'analytics')} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {/* ── TAB 1: Campaigns list ── */}
      {tab === 'campaigns' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#444', padding: 60, fontSize: 18 }}>Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center', padding: '80px 20px',
                background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 20,
              }}
            >
              <div style={{ fontSize: 64, marginBottom: 20 }}>📣</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>No campaigns yet</div>
              <div style={{ color: '#444', fontSize: 14, marginBottom: 28 }}>Create your first campaign to start reaching customers</div>
              <button
                onClick={() => setTab('create')}
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#000',
                  border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >Create Your First Campaign</button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
              <AnimatePresence>
                {campaigns.map((c) => (
                  <CampaignCard
                    key={c._id}
                    campaign={c}
                    onSend={handleSend}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* ── TAB 2: Create/Edit Campaign ── */}
      {tab === 'create' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CreateCampaignForm
            initialSegment={segmentParam ?? undefined}
            onCreated={handleCreated}
            editingCampaign={editingCampaign}
            onUpdated={handleCreated}
            onCancel={() => { setEditingCampaign(undefined); setTab('campaigns'); }}
          />
        </motion.div>
      )}

      {/* ── TAB 3: Analytics ── */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnalyticsTab campaigns={campaigns} />
        </motion.div>
      )}
    </div>
  );
}

// ─── Page (Suspense wrapper for useSearchParams) ───────────────────────────────

export default function MarketingPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#d4af37', fontSize: 18 }}>Loading...</div>
      </div>
    }>
      <MarketingInner />
    </Suspense>
  );
}

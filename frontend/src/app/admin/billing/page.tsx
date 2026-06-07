'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Receipt,
  Percent,
  Truck,
  CreditCard,
  FileText,
  Crown,
  Save,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  BadgeCheck,
  Clock,
  Ban,
} from 'lucide-react';
import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RestaurantData {
  _id?: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  taxRate: number;
  serviceCharge: number;
  currency: string;
  razorpayKeyId?: string;
  notificationEmail?: string;
  subscriptionStatus?: 'trial' | 'active' | 'suspended' | 'cancelled';
  trialEndsAt?: string;
  currentPlanId?: string | { _id: string; name: string; price?: number };
}

interface SubscriptionData {
  _id: string;
  status: 'active' | 'expired' | 'cancelled' | 'past_due';
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
  planId?: { _id: string; name: string; price?: number };
}

interface BillingSettings {
  // Tax
  taxRate: number;
  serviceCharge: number;
  // Delivery
  deliveryFee: number;
  freeDeliveryAbove: number;
  deliveryEnabled: boolean;
  // Payments
  enableCOD: boolean;
  enableOnlinePayment: boolean;
  razorpayKeyId: string;
  // Invoice / receipt
  receiptName: string;
  receiptAddress: string;
  receiptPhone: string;
  receiptFooterNote: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d?: string | Date) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: '#141414',
  border: '1px solid rgba(200,151,42,0.15)',
  borderRadius: '16px',
  padding: '24px',
};

const INPUT_STYLE: React.CSSProperties = {
  background: '#1c1c1c',
  border: '1px solid rgba(200,151,42,0.2)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#f8f4ed',
  outline: 'none',
  width: '100%',
  fontSize: '14px',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: '#a89070',
  marginBottom: '6px',
  fontWeight: 500,
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#f8f4ed',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const GOLD_BTN: React.CSSProperties = {
  background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
  color: '#080808',
  fontWeight: 700,
  fontSize: '14px',
  padding: '10px 24px',
  borderRadius: '10px',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const GOLD_BTN_DISABLED: React.CSSProperties = {
  ...GOLD_BTN,
  opacity: 0.5,
  cursor: 'not-allowed',
};

// ─── Toggle Switch Component ──────────────────────────────────────────────────

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <span style={{ fontSize: '14px', color: '#f8f4ed' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          background: enabled ? '#c8972a' : 'rgba(200,151,42,0.15)',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: enabled ? '23px' : '3px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: enabled ? '#080808' : '#6b5040',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '12px',
            background: t.type === 'success' ? 'rgba(20,40,20,0.97)' : 'rgba(40,15,15,0.97)',
            border: `1px solid ${t.type === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
            color: t.type === 'success' ? '#22c55e' : '#ef4444',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
            minWidth: '280px',
            maxWidth: '400px',
          }}
          onClick={() => onRemove(t.id)}
        >
          {t.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Subscription Badge ───────────────────────────────────────────────────────

function SubBadge({ status }: { status?: string }) {
  const styles: Record<string, React.CSSProperties> = {
    active:    { background: 'rgba(34,197,94,0.12)',  color: '#22c55e',  border: '1px solid rgba(34,197,94,0.25)' },
    trial:     { background: 'rgba(200,151,42,0.12)', color: '#f0c060',  border: '1px solid rgba(200,151,42,0.25)' },
    suspended: { background: 'rgba(239,68,68,0.12)',  color: '#ef4444',  border: '1px solid rgba(239,68,68,0.25)' },
    cancelled: { background: 'rgba(107,80,64,0.12)',  color: '#a89070',  border: '1px solid rgba(107,80,64,0.25)' },
    expired:   { background: 'rgba(239,68,68,0.12)',  color: '#ef4444',  border: '1px solid rgba(239,68,68,0.25)' },
    past_due:  { background: 'rgba(251,146,60,0.12)', color: '#fb923c',  border: '1px solid rgba(251,146,60,0.25)' },
  };

  const icons: Record<string, React.ReactNode> = {
    active:    <BadgeCheck size={13} />,
    trial:     <Clock size={13} />,
    suspended: <Ban size={13} />,
    cancelled: <XCircle size={13} />,
    expired:   <XCircle size={13} />,
    past_due:  <AlertCircle size={13} />,
  };

  const key = status || 'cancelled';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        ...(styles[key] || styles.cancelled),
      }}
    >
      {icons[key]}
      {key.replace('_', ' ')}
    </span>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(200,151,42,0.08)', margin: '20px 0' }} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'tax' | 'delivery' | 'payments' | 'invoice' | 'subscription';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'tax',          label: 'Tax & Charges',    icon: <Percent size={15} /> },
  { id: 'delivery',     label: 'Delivery',          icon: <Truck size={15} /> },
  { id: 'payments',     label: 'Payment Methods',   icon: <CreditCard size={15} /> },
  { id: 'invoice',      label: 'Invoice / Receipt', icon: <FileText size={15} /> },
  { id: 'subscription', label: 'Subscription',      icon: <Crown size={15} /> },
];

export default function BillingManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tax');
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  const [settings, setSettings] = useState<BillingSettings>({
    taxRate: 5,
    serviceCharge: 0,
    deliveryFee: 40,
    freeDeliveryAbove: 500,
    deliveryEnabled: true,
    enableCOD: true,
    enableOnlinePayment: true,
    razorpayKeyId: '',
    receiptName: '',
    receiptAddress: '',
    receiptPhone: '',
    receiptFooterNote: 'Thank you for dining with us!',
  });

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToastCounter((c) => {
      const id = c + 1;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
      return id;
    });
  }, []);

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<RestaurantData>('/restaurants/me');
      setRestaurant(data);
      setSettings((prev) => ({
        ...prev,
        taxRate: data.taxRate ?? 5,
        serviceCharge: data.serviceCharge ?? 0,
        razorpayKeyId: data.razorpayKeyId || '',
        receiptName: data.name || '',
        receiptAddress: [data.address, data.city, data.state, data.pincode].filter(Boolean).join(', '),
        receiptPhone: data.phone || '',
      }));
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load restaurant settings');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadSubscription = useCallback(async () => {
    try {
      setSubLoading(true);
      const data = await api.get<SubscriptionData[]>('/restaurants/me/subscriptions');
      if (Array.isArray(data) && data.length > 0) {
        // Most recent active or latest subscription
        const active = data.find((s) => s.status === 'active') || data[0];
        setSubscription(active);
      }
    } catch {
      // Not fatal — subscription info is optional display
    } finally {
      setSubLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  useEffect(() => {
    if (activeTab === 'subscription') loadSubscription();
  }, [activeTab, loadSubscription]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: Record<string, any> = {};

      if (activeTab === 'tax') {
        payload.taxRate = settings.taxRate;
        payload.serviceCharge = settings.serviceCharge;
      } else if (activeTab === 'delivery') {
        payload.deliveryFee = settings.deliveryFee;
        payload.freeDeliveryAbove = settings.freeDeliveryAbove;
        payload.deliveryEnabled = settings.deliveryEnabled;
      } else if (activeTab === 'payments') {
        payload.enableCOD = settings.enableCOD;
        payload.enableOnlinePayment = settings.enableOnlinePayment;
        if (settings.razorpayKeyId) payload.razorpayKeyId = settings.razorpayKeyId;
      } else if (activeTab === 'invoice') {
        payload.invoiceReceiptName = settings.receiptName;
        payload.invoiceReceiptAddress = settings.receiptAddress;
        payload.invoiceReceiptPhone = settings.receiptPhone;
        payload.invoiceReceiptFooter = settings.receiptFooterNote;
      }

      await api.put('/restaurants/me', payload);
      showToast('success', 'Settings saved successfully');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // ── Number input setter ────────────────────────────────────────────────────

  const setNum = (key: keyof BillingSettings, val: string) => {
    const n = parseFloat(val);
    setSettings((prev) => ({ ...prev, [key]: isNaN(n) ? 0 : n }));
  };

  const setStr = (key: keyof BillingSettings, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const setBool = (key: keyof BillingSettings, val: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} style={{ color: '#c8972a', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#a89070' }}>Loading billing settings...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const planName =
    typeof restaurant?.currentPlanId === 'object' && restaurant.currentPlanId !== null
      ? (restaurant.currentPlanId as any).name
      : subscription?.planId?.name || 'Free / Trial';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg,#8b5a00,#c8972a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt size={20} style={{ color: '#080808' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8f4ed', margin: 0 }}>Billing Management</h1>
            <p style={{ fontSize: '13px', color: '#a89070', margin: 0 }}>Manage tax, delivery, payment methods and invoice settings</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '24px',
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.12)',
          borderRadius: '14px',
          padding: '6px',
          flexWrap: 'wrap',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={
              activeTab === tab.id
                ? {
                    background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                    color: '#080808',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }
                : {
                    background: 'transparent',
                    color: '#a89070',
                    fontWeight: 500,
                    fontSize: '13px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }
            }
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tax & Charges ── */}
      {activeTab === 'tax' && (
        <div style={CARD_STYLE}>
          <h2 style={SECTION_TITLE_STYLE}>
            <Percent size={18} style={{ color: '#c8972a' }} />
            Tax &amp; Service Charges
          </h2>
          <p style={{ fontSize: '13px', color: '#6b5040', marginBottom: '24px' }}>
            These rates are applied automatically on bills and invoices generated for your restaurant.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={LABEL_STYLE}>GST / Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={settings.taxRate}
                onChange={(e) => setNum('taxRate', e.target.value)}
                style={INPUT_STYLE}
              />
              <p style={{ fontSize: '11px', color: '#6b5040', marginTop: '4px' }}>
                Typical values: 5% (restaurants), 12% (AC restaurants), 18% (luxury)
              </p>
            </div>

            <div>
              <label style={LABEL_STYLE}>Service Charge (%)</label>
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={settings.serviceCharge}
                onChange={(e) => setNum('serviceCharge', e.target.value)}
                style={INPUT_STYLE}
              />
              <p style={{ fontSize: '11px', color: '#6b5040', marginTop: '4px' }}>
                Set 0 to disable. Service charge is not a govt. levy.
              </p>
            </div>
          </div>

          <Divider />

          {/* Preview */}
          <div
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.12)',
              borderRadius: '12px',
              padding: '16px 20px',
            }}
          >
            <p style={{ fontSize: '12px', color: '#a89070', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Bill Preview — sample ₹1,000 order
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8f4ed' }}>
                <span>Subtotal</span><span>₹1,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a89070' }}>
                <span>GST ({settings.taxRate}%)</span>
                <span>₹{(1000 * settings.taxRate / 100).toFixed(0)}</span>
              </div>
              {settings.serviceCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a89070' }}>
                  <span>Service Charge ({settings.serviceCharge}%)</span>
                  <span>₹{(1000 * settings.serviceCharge / 100).toFixed(0)}</span>
                </div>
              )}
              <div style={{ height: '1px', background: 'rgba(200,151,42,0.12)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0c060', fontWeight: 700, fontSize: '14px' }}>
                <span>Grand Total</span>
                <span>₹{(1000 + 1000 * settings.taxRate / 100 + 1000 * settings.serviceCharge / 100).toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              style={saving ? GOLD_BTN_DISABLED : GOLD_BTN}
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Tax Settings'}
            </button>
          </div>
        </div>
      )}

      {/* ── Delivery Charges ── */}
      {activeTab === 'delivery' && (
        <div style={CARD_STYLE}>
          <h2 style={SECTION_TITLE_STYLE}>
            <Truck size={18} style={{ color: '#c8972a' }} />
            Delivery Charge Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#6b5040', marginBottom: '24px' }}>
            Configure delivery fees and minimum order amount for free delivery.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <Toggle
              enabled={settings.deliveryEnabled}
              onChange={(v) => setBool('deliveryEnabled', v)}
              label="Enable Delivery"
            />
          </div>

          <Divider />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              opacity: settings.deliveryEnabled ? 1 : 0.4,
              pointerEvents: settings.deliveryEnabled ? 'auto' : 'none',
            }}
          >
            <div>
              <label style={LABEL_STYLE}>Delivery Fee (₹)</label>
              <input
                type="number"
                min={0}
                step={5}
                value={settings.deliveryFee}
                onChange={(e) => setNum('deliveryFee', e.target.value)}
                style={INPUT_STYLE}
              />
              <p style={{ fontSize: '11px', color: '#6b5040', marginTop: '4px' }}>
                Charged per delivery order
              </p>
            </div>

            <div>
              <label style={LABEL_STYLE}>Free Delivery Above (₹)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={settings.freeDeliveryAbove}
                onChange={(e) => setNum('freeDeliveryAbove', e.target.value)}
                style={INPUT_STYLE}
              />
              <p style={{ fontSize: '11px', color: '#6b5040', marginTop: '4px' }}>
                Set 0 to never offer free delivery
              </p>
            </div>
          </div>

          <Divider />

          <div
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.12)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '13px',
              color: '#a89070',
            }}
          >
            {settings.deliveryEnabled ? (
              <>
                Delivery is <span style={{ color: '#22c55e' }}>enabled</span>.
                {settings.freeDeliveryAbove > 0
                  ? <> Orders above <span style={{ color: '#f0c060' }}>{fmtCurrency(settings.freeDeliveryAbove)}</span> get free delivery. Below that, a fee of <span style={{ color: '#f0c060' }}>{fmtCurrency(settings.deliveryFee)}</span> is charged.</>
                  : <> A flat delivery fee of <span style={{ color: '#f0c060' }}>{fmtCurrency(settings.deliveryFee)}</span> applies to all orders.</>}
              </>
            ) : (
              <>Delivery is currently <span style={{ color: '#ef4444' }}>disabled</span>. Customers cannot place delivery orders.</>
            )}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              style={saving ? GOLD_BTN_DISABLED : GOLD_BTN}
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Delivery Settings'}
            </button>
          </div>
        </div>
      )}

      {/* ── Payment Methods ── */}
      {activeTab === 'payments' && (
        <div style={CARD_STYLE}>
          <h2 style={SECTION_TITLE_STYLE}>
            <CreditCard size={18} style={{ color: '#c8972a' }} />
            Payment Methods
          </h2>
          <p style={{ fontSize: '13px', color: '#6b5040', marginBottom: '24px' }}>
            Control which payment methods customers can use when placing orders.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#1c1c1c',
                border: '1px solid rgba(200,151,42,0.1)',
                borderRadius: '12px',
                padding: '16px 18px',
              }}
            >
              <Toggle
                enabled={settings.enableCOD}
                onChange={(v) => setBool('enableCOD', v)}
                label="Cash on Delivery (COD)"
              />
              <p style={{ fontSize: '12px', color: '#6b5040', marginTop: '8px' }}>
                Allow customers to pay in cash when the order is delivered or at table.
              </p>
            </div>

            <div
              style={{
                background: '#1c1c1c',
                border: '1px solid rgba(200,151,42,0.1)',
                borderRadius: '12px',
                padding: '16px 18px',
              }}
            >
              <Toggle
                enabled={settings.enableOnlinePayment}
                onChange={(v) => setBool('enableOnlinePayment', v)}
                label="Online Payment (Razorpay)"
              />
              <p style={{ fontSize: '12px', color: '#6b5040', marginTop: '8px' }}>
                Accept UPI, cards, net banking via Razorpay.
              </p>
            </div>
          </div>

          <Divider />

          <div style={{ opacity: settings.enableOnlinePayment ? 1 : 0.4, pointerEvents: settings.enableOnlinePayment ? 'auto' : 'none' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8f4ed', marginBottom: '14px' }}>Razorpay Configuration</h3>
            <div>
              <label style={LABEL_STYLE}>Razorpay Key ID</label>
              <input
                type="text"
                value={settings.razorpayKeyId}
                onChange={(e) => setStr('razorpayKeyId', e.target.value)}
                placeholder="rzp_live_XXXXXXXXXXXXXX"
                style={INPUT_STYLE}
              />
              <p style={{ fontSize: '11px', color: '#6b5040', marginTop: '4px' }}>
                Find this in your Razorpay Dashboard → Settings → API Keys. The secret key is managed separately in secure settings.
              </p>
            </div>
          </div>

          <Divider />

          <div
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.1)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '13px',
            }}
          >
            <p style={{ color: '#a89070', margin: 0 }}>
              Active methods:{' '}
              {[settings.enableCOD && 'Cash on Delivery', settings.enableOnlinePayment && 'Online (Razorpay)']
                .filter(Boolean)
                .join(', ') || <span style={{ color: '#ef4444' }}>No payment methods enabled!</span>}
            </p>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              style={saving ? GOLD_BTN_DISABLED : GOLD_BTN}
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </div>
        </div>
      )}

      {/* ── Invoice / Receipt ── */}
      {activeTab === 'invoice' && (
        <div style={CARD_STYLE}>
          <h2 style={SECTION_TITLE_STYLE}>
            <FileText size={18} style={{ color: '#c8972a' }} />
            Invoice &amp; Receipt Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#6b5040', marginBottom: '24px' }}>
            This information appears on printed bills and email receipts sent to customers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div>
              <label style={LABEL_STYLE}>Restaurant Name on Receipt</label>
              <input
                type="text"
                value={settings.receiptName}
                onChange={(e) => setStr('receiptName', e.target.value)}
                placeholder="e.g. Spice Garden Restaurant"
                style={INPUT_STYLE}
              />
            </div>

            <div>
              <label style={LABEL_STYLE}>Phone on Receipt</label>
              <input
                type="text"
                value={settings.receiptPhone}
                onChange={(e) => setStr('receiptPhone', e.target.value)}
                placeholder="+91 98765 43210"
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={LABEL_STYLE}>Address on Receipt</label>
            <textarea
              value={settings.receiptAddress}
              onChange={(e) => setStr('receiptAddress', e.target.value)}
              rows={2}
              placeholder="123, Main Street, City, State - 400001"
              style={{ ...INPUT_STYLE, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={LABEL_STYLE}>Footer Note on Receipt</label>
            <input
              type="text"
              value={settings.receiptFooterNote}
              onChange={(e) => setStr('receiptFooterNote', e.target.value)}
              placeholder="Thank you for dining with us!"
              style={INPUT_STYLE}
            />
            <p style={{ fontSize: '11px', color: '#6b5040', marginTop: '4px' }}>
              Appears at the bottom of every receipt / invoice
            </p>
          </div>

          <Divider />

          {/* Receipt preview */}
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#a89070', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Receipt Preview
          </h3>
          <div
            style={{
              background: '#f8f4ed',
              color: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              maxWidth: '340px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{settings.receiptName || 'Your Restaurant'}</div>
              <div style={{ color: '#444', marginTop: '2px' }}>{settings.receiptAddress || 'Restaurant Address'}</div>
              <div style={{ color: '#444' }}>Ph: {settings.receiptPhone || 'Phone Number'}</div>
            </div>
            <div style={{ borderTop: '1px dashed #aaa', borderBottom: '1px dashed #aaa', padding: '8px 0', margin: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹500</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST ({settings.taxRate}%)</span><span>₹{(500 * settings.taxRate / 100).toFixed(0)}</span></div>
              {settings.serviceCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service ({settings.serviceCharge}%)</span><span>₹{(500 * settings.serviceCharge / 100).toFixed(0)}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '4px' }}>
                <span>TOTAL</span>
                <span>₹{(500 + 500 * settings.taxRate / 100 + 500 * settings.serviceCharge / 100).toFixed(0)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', color: '#555', fontSize: '11px', marginTop: '6px' }}>
              {settings.receiptFooterNote || 'Thank you!'}
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              style={saving ? GOLD_BTN_DISABLED : GOLD_BTN}
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Invoice Settings'}
            </button>
          </div>
        </div>
      )}

      {/* ── Subscription ── */}
      {activeTab === 'subscription' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current plan card */}
          <div style={CARD_STYLE}>
            <h2 style={SECTION_TITLE_STYLE}>
              <Crown size={18} style={{ color: '#c8972a' }} />
              Current Subscription
            </h2>

            {subLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#a89070' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
                <p style={{ margin: 0 }}>Loading subscription...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Plan name */}
                <div
                  style={{
                    background: 'linear-gradient(135deg,rgba(139,90,0,0.18),rgba(200,151,42,0.08))',
                    border: '1px solid rgba(200,151,42,0.2)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                  }}
                >
                  <p style={{ fontSize: '11px', color: '#a89070', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Plan</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#f0c060', margin: 0 }}>{planName}</p>
                </div>

                {/* Status */}
                <div
                  style={{
                    background: '#1c1c1c',
                    border: '1px solid rgba(200,151,42,0.12)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                  }}
                >
                  <p style={{ fontSize: '11px', color: '#a89070', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Status</p>
                  <SubBadge status={subscription?.status || restaurant?.subscriptionStatus} />
                </div>

                {/* Billing cycle */}
                {subscription && (
                  <div
                    style={{
                      background: '#1c1c1c',
                      border: '1px solid rgba(200,151,42,0.12)',
                      borderRadius: '12px',
                      padding: '16px 18px',
                    }}
                  >
                    <p style={{ fontSize: '11px', color: '#a89070', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Billing Cycle</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#f8f4ed', margin: 0, textTransform: 'capitalize' }}>{subscription.billingCycle}</p>
                    <p style={{ fontSize: '12px', color: '#a89070', margin: '4px 0 0' }}>
                      {fmtCurrency(subscription.amount, subscription.currency)} / {subscription.billingCycle === 'yearly' ? 'year' : 'month'}
                    </p>
                  </div>
                )}

                {/* Expiry */}
                <div
                  style={{
                    background: '#1c1c1c',
                    border: '1px solid rgba(200,151,42,0.12)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                  }}
                >
                  <p style={{ fontSize: '11px', color: '#a89070', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                    {restaurant?.subscriptionStatus === 'trial' ? 'Trial Ends' : 'Renews / Expires'}
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#f8f4ed', margin: 0 }}>
                    {restaurant?.subscriptionStatus === 'trial'
                      ? fmtDate(restaurant?.trialEndsAt)
                      : subscription?.endDate
                        ? fmtDate(subscription.endDate)
                        : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Subscription detail table */}
          {subscription && (
            <div style={CARD_STYLE}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8f4ed', marginBottom: '16px' }}>Subscription Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  ['Invoice Number', subscription.invoiceNumber || '—'],
                  ['Start Date', fmtDate(subscription.startDate)],
                  ['End Date', fmtDate(subscription.endDate)],
                  ['Amount Paid', fmtCurrency(subscription.amount, subscription.currency)],
                  ['Payment Method', subscription.paymentMethod?.replace('_', ' ') || '—'],
                  ['Auto Renew', subscription.autoRenew ? 'Yes' : 'No'],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < 5 ? '1px solid rgba(200,151,42,0.07)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#a89070' }}>{label}</span>
                    <span style={{ fontSize: '13px', color: '#f8f4ed', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info note */}
          <div
            style={{
              background: 'rgba(200,151,42,0.06)',
              border: '1px solid rgba(200,151,42,0.15)',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertCircle size={16} style={{ color: '#c8972a', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '13px', color: '#a89070', margin: 0 }}>
              To upgrade, change, or cancel your subscription plan, please contact the platform support team or visit the subscription management portal. Only super admins can modify plan assignments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

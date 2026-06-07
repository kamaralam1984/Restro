'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: '#080808',
  panel: '#0f0f0f',
  card: '#141414',
  cardHover: '#1a1a1a',
  input: '#1c1c1c',
  gold: '#c8972a',
  goldLight: '#f0c060',
  goldDim: 'rgba(200,151,42,0.15)',
  text: '#f8f4ed',
  muted: '#9a8878',
  border: 'rgba(200,151,42,0.15)',
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isVeg: boolean;
  available: boolean;
  image?: string;
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  isVeg: boolean;
}

interface CouponResult {
  valid: boolean;
  discount?: number;
  type?: 'percentage' | 'flat';
  value?: number;
  message?: string;
}

type OrderType = 'DINE-IN' | 'TAKEAWAY' | 'DELIVERY';
type PaymentMethod = 'cash' | 'card' | 'online' | 'split';

interface PlacedOrder {
  _id: string;
  orderNumber: string;
  total: number;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const now = () =>
  new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ───────────────────────────────────────────────────────────

function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <div style={{ width: 16, height: 16, border: `2px solid ${isVeg ? T.green : T.red}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: isVeg ? T.green : T.red }} />
    </div>
  );
}

function CategoryTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 20,
        border: active ? `1px solid ${T.gold}` : '1px solid rgba(255,255,255,0.08)',
        background: active ? `rgba(200,151,42,0.18)` : 'transparent',
        color: active ? T.gold : T.muted,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </motion.button>
  );
}

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [flash, setFlash] = useState(false);

  const handleClick = () => {
    if (!item.available) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    onAdd(item);
  };

  return (
    <motion.div
      whileTap={item.available ? { scale: 0.95 } : undefined}
      onClick={handleClick}
      style={{
        background: flash ? `rgba(200,151,42,0.22)` : T.card,
        border: `1px solid ${flash ? T.gold : T.border}`,
        borderRadius: 12,
        padding: '14px 12px',
        cursor: item.available ? 'pointer' : 'not-allowed',
        opacity: item.available ? 1 : 0.4,
        transition: 'background 0.2s, border 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        userSelect: 'none',
        minHeight: 90,
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <VegDot isVeg={item.isVeg} />
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.3, flex: 1 }}>{item.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.gold }}>{fmt(item.price)}</span>
        {!item.available && (
          <span style={{ fontSize: 10, color: T.red, fontWeight: 600, background: 'rgba(239,68,68,0.12)', padding: '2px 6px', borderRadius: 4 }}>OUT</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Split Bill Modal ─────────────────────────────────────────────────────────

function SplitBillModal({
  total,
  onConfirm,
  onClose,
}: {
  total: number;
  onConfirm: (splits: number[]) => void;
  onClose: () => void;
}) {
  const [splits, setSplits] = useState<string[]>(['', '']);
  const splitSum = splits.reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const remaining = Math.round((total - splitSum) * 100) / 100;

  const updateSplit = (i: number, val: string) => {
    const next = [...splits];
    next[i] = val;
    setSplits(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw' }}
      >
        <h3 style={{ color: T.gold, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Split Bill</h3>
        <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Total: {fmt(total)}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {splits.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: T.muted, fontSize: 13, width: 60 }}>Person {i + 1}</span>
              <input
                type="number"
                value={v}
                onChange={(e) => updateSplit(i, e.target.value)}
                placeholder="Amount"
                style={{ flex: 1, background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text, fontSize: 14 }}
              />
              {splits.length > 2 && (
                <button onClick={() => setSplits(splits.filter((_, idx) => idx !== i))} style={{ color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setSplits([...splits, ''])}
          style={{ color: T.gold, background: 'none', border: `1px dashed ${T.gold}`, borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
        >
          + Add Person
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ color: T.muted, fontSize: 13 }}>Remaining</span>
          <span style={{ color: remaining === 0 ? T.green : T.red, fontWeight: 700, fontSize: 14 }}>{fmt(remaining)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'none', color: T.muted, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => remaining === 0 && onConfirm(splits.map((v) => parseFloat(v) || 0))}
            disabled={remaining !== 0}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: remaining === 0 ? T.gold : '#333', color: remaining === 0 ? '#000' : T.muted, fontWeight: 700, cursor: remaining === 0 ? 'pointer' : 'not-allowed' }}
          >
            Confirm Split
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Receipt Overlay ──────────────────────────────────────────────────────────

function ReceiptOverlay({
  order,
  cart,
  subtotal,
  tax,
  discount,
  total,
  orderType,
  tableNumber,
  customerName,
  paymentMethod,
  restaurantName,
  onNewBill,
}: {
  order: PlacedOrder;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  restaurantName: string;
  onNewBill: () => void;
}) {
  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const lines = [
      `*${restaurantName}*`,
      `Order #${order.orderNumber}`,
      now(),
      `---`,
      ...cart.map((i) => `${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`),
      `---`,
      `Subtotal: ${fmt(subtotal)}`,
      `Tax (5%): ${fmt(tax)}`,
      discount > 0 ? `Discount: -${fmt(discount)}` : '',
      `*Total: ${fmt(total)}*`,
      `Payment: ${paymentMethod.toUpperCase()}`,
      `Thank you for dining with us!`,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ background: '#fff', borderRadius: 8, width: 360, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', color: '#111', fontFamily: 'monospace' }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '2px dashed #ddd', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{restaurantName}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{now()}</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, background: '#111', color: '#fff', padding: '4px 12px', borderRadius: 4, display: 'inline-block' }}>
            Order #{order.orderNumber}
          </div>
          <div style={{ fontSize: 12, marginTop: 6, color: '#444' }}>
            {orderType}{tableNumber ? ` | Table: ${tableNumber}` : ''}{customerName ? ` | ${customerName}` : ''}
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '2px dashed #ddd' }}>
          {cart.map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span>{item.name} × {item.qty}</span>
              <span style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '2px dashed #ddd', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>GST (5%)</span><span>{fmt(tax)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'green' }}>
              <span>Discount</span><span>-{fmt(discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid #ddd' }}>
            <span>TOTAL</span><span>{fmt(total)}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>Payment: {paymentMethod.toUpperCase()}</div>
        </div>

        <div style={{ padding: '16px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 16 }}>Thank you for dining with us!</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={onNewBill}
              style={{ padding: '12px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              New Bill
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handlePrint}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Print
              </button>
              <button
                onClick={handleWhatsApp}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#25D366', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main POS Page ────────────────────────────────────────────────────────────

export default function POSPage() {
  // Auth
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('Restro OS');
  const [token, setToken] = useState('');

  // Menu state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuLoading, setMenuLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE-IN');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Discount / coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [manualDiscount, setManualDiscount] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showSplit, setShowSplit] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<number[]>([]);

  // Order
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const cartEndRef = useRef<HTMLDivElement>(null);

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
    try {
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      setRestaurantId(admin.restaurantId || '');
      setRestaurantName(admin.restaurantName || admin.name || 'Restro OS');
    } catch {}
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchMenu();
      fetchCategories();
    }
  }, [restaurantId]);

  // ── Keyboard shortcut ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handlePlaceOrder();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // ── Scroll cart to bottom on new item ────────────────────────────────────
  useEffect(() => {
    cartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cart.length]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const data = await api.get<Array<{ name: string }>>(`/menu/categories?restaurant=${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const names = Array.isArray(data) ? data.map((c) => (typeof c === 'string' ? c : c.name)) : [];
      setCategories(names);
    } catch {
      setCategories(['appetizer', 'main', 'dessert', 'beverage']);
    }
  };

  const fetchMenu = async () => {
    try {
      setMenuLoading(true);
      const data = await api.get<MenuItem[]>(`/menu?restaurant=${restaurantId}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(Array.isArray(data) ? data : []);
    } catch {
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  // ── Cart logic ────────────────────────────────────────────────────────────
  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) return prev.map((c) => c._id === item._id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { _id: item._id, name: item.name, price: item.price, qty: 1, isVeg: item.isVeg }];
    });
  }, []);

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c._id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c._id !== id));
  };

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxRate = 0.05;
  const tax = Math.round(subtotal * taxRate * 100) / 100;

  let discountAmt = 0;
  if (couponResult?.valid && couponResult.discount) {
    discountAmt = couponResult.discount;
  } else if (manualDiscount) {
    const pct = parseFloat(manualDiscount);
    if (!isNaN(pct) && pct > 0 && pct <= 100) discountAmt = Math.round(subtotal * pct / 100 * 100) / 100;
  }

  const grandTotal = Math.max(0, subtotal + tax - discountAmt);

  // ── Coupon ────────────────────────────────────────────────────────────────
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await api.post<CouponResult>('/coupons/validate', {
        code: couponCode.trim(),
        orderAmount: subtotal,
        restaurantId,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setCouponResult(result);
    } catch (err: any) {
      setCouponResult({ valid: false, message: err.message || 'Invalid coupon' });
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Place Order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cart.length === 0) { setErrorMsg('Cart is empty'); return; }
    setErrorMsg('');
    setPlacing(true);
    try {
      const payload: any = {
        restaurantId,
        items: cart.map((i) => ({ menuItem: i._id, name: i.name, quantity: i.qty, price: i.price })),
        orderType,
        tableNumber: tableNumber || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        subtotal,
        tax,
        discount: discountAmt,
        total: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        couponCode: couponResult?.valid ? couponCode : undefined,
        splitAmounts: paymentMethod === 'split' ? splitAmounts : undefined,
      };
      const res = await api.post<PlacedOrder>('/orders', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlacedOrder(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleNewBill = () => {
    setCart([]);
    setPlacedOrder(null);
    setOrderType('DINE-IN');
    setTableNumber('');
    setCustomerName('');
    setCustomerPhone('');
    setCouponCode('');
    setCouponResult(null);
    setManualDiscount('');
    setPaymentMethod('cash');
    setSplitAmounts([]);
    setErrorMsg('');
  };

  // ── Filtered items ────────────────────────────────────────────────────────
  const filteredItems = menuItems.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ─── Order type badge colors ───────────────────────────────────────────────
  const orderTypeBadge: Record<OrderType, string> = { 'DINE-IN': T.gold, TAKEAWAY: T.blue, DELIVERY: T.purple };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: T.input,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '9px 12px',
    color: T.text,
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const payBtn = (method: PaymentMethod, label: string, color: string): React.CSSProperties => ({
    flex: 1,
    padding: '9px 4px',
    borderRadius: 8,
    border: paymentMethod === method ? `1.5px solid ${color}` : `1px solid rgba(255,255,255,0.08)`,
    background: paymentMethod === method ? `rgba(${method === 'cash' ? '34,197,94' : method === 'card' ? '59,130,246' : method === 'online' ? '168,85,247' : '200,151,42'},0.12)` : 'transparent',
    color: paymentMethod === method ? color : T.muted,
    fontSize: 12,
    fontWeight: paymentMethod === method ? 700 : 400,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ width: '100vw', height: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: T.text }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>POS</span>
          <span style={{ color: T.muted, fontSize: 13 }}>Billing System</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: T.muted, fontSize: 12 }}>Ctrl+Enter to place order</span>
          <span style={{ color: T.muted, fontSize: 12 }}>|</span>
          <span style={{ color: T.text, fontSize: 13 }}>{restaurantName}</span>
        </div>
      </div>

      {/* ── Main panels ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ════════ LEFT PANEL ════════ */}
        <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.border}`, overflow: 'hidden' }}>

          {/* Search + Category bar */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, background: T.panel }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              style={{ ...inputStyle, fontSize: 14, padding: '10px 14px' }}
            />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              <CategoryTab label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
              {categories.map((cat) => (
                <CategoryTab key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
              ))}
            </div>
          </div>

          {/* Menu grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            {menuLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: T.muted, fontSize: 14 }}>Loading menu...</div>
            ) : filteredItems.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: T.muted, fontSize: 14 }}>No items found</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {filteredItems.map((item) => (
                  <MenuCard key={item._id} item={item} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════════ RIGHT PANEL ════════ */}
        <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.panel }}>

          {/* Cart header */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Order Bill</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['DINE-IN', 'TAKEAWAY', 'DELIVERY'] as OrderType[]).map((type) => (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOrderType(type)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: orderType === type ? `1.5px solid ${orderTypeBadge[type]}` : '1px solid rgba(255,255,255,0.08)',
                      background: orderType === type ? `rgba(200,151,42,0.1)` : 'transparent',
                      color: orderType === type ? orderTypeBadge[type] : T.muted,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: 0.5,
                    }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Table + Customer inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder={orderType === 'DINE-IN' ? 'Table Number' : 'Reference'}
                style={inputStyle}
              />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                style={inputStyle}
              />
            </div>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (optional)"
              style={inputStyle}
            />
          </div>

          {/* Cart items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.muted, gap: 8 }}>
                <span style={{ fontSize: 36 }}>🛒</span>
                <span style={{ fontSize: 13 }}>Cart is empty — tap items to add</span>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                    >
                      <VegDot isVeg={item.isVeg} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>{fmt(item.price)} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => updateQty(item._id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}`, background: T.input, color: T.text, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ width: 24, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{item.qty}</span>
                        <button onClick={() => updateQty(item._id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.gold}`, background: 'rgba(200,151,42,0.1)', color: T.gold, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.gold, minWidth: 64, textAlign: 'right' }}>{fmt(item.price * item.qty)}</span>
                      <button onClick={() => removeFromCart(item._id)} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: T.red, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={cartEndRef} />
              </>
            )}
          </div>

          {/* Bottom billing section */}
          <div style={{ flexShrink: 0, borderTop: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Coupon / Discount */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                  placeholder="COUPON CODE"
                  style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', letterSpacing: 1 }}
                />
                <button
                  onClick={validateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  style={{ padding: '9px 14px', borderRadius: 8, border: `1px solid ${T.gold}`, background: 'rgba(200,151,42,0.1)', color: T.gold, fontWeight: 700, fontSize: 13, cursor: couponCode.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {couponResult && (
                <div style={{ fontSize: 12, color: couponResult.valid ? T.green : T.red, background: couponResult.valid ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', padding: '4px 10px', borderRadius: 6 }}>
                  {couponResult.valid ? `Coupon applied! -${fmt(couponResult.discount || 0)}` : couponResult.message}
                </div>
              )}
              {!couponResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: T.muted, fontSize: 12, whiteSpace: 'nowrap' }}>Manual %</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(e.target.value)}
                    placeholder="0"
                    style={{ ...inputStyle, width: 70 }}
                  />
                  <span style={{ color: T.muted, fontSize: 12 }}>discount</span>
                </div>
              )}
            </div>

            {/* Bill summary */}
            <div style={{ background: T.card, borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 5, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.muted }}>
                <span>Subtotal</span><span style={{ color: T.text }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.muted }}>
                <span>GST (5%)</span><span style={{ color: T.text }}>{fmt(tax)}</span>
              </div>
              {discountAmt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: T.green }}>Discount</span><span style={{ color: T.green }}>-{fmt(discountAmt)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Grand Total</span>
                <span style={{ fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{fmt(grandTotal)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={payBtn('cash', 'Cash', T.green)} onClick={() => setPaymentMethod('cash')}>Cash</button>
              <button style={payBtn('card', 'Card', T.blue)} onClick={() => setPaymentMethod('card')}>Card</button>
              <button style={payBtn('online', 'Online', T.purple)} onClick={() => setPaymentMethod('online')}>Online</button>
              <button
                style={{ ...payBtn('split', 'Split', T.gold), position: 'relative' }}
                onClick={() => { setPaymentMethod('split'); setShowSplit(true); }}
              >
                Split
              </button>
            </div>

            {/* Error */}
            {errorMsg && (
              <div style={{ fontSize: 12, color: T.red, background: 'rgba(239,68,68,0.08)', padding: '6px 10px', borderRadius: 6 }}>
                {errorMsg}
              </div>
            )}

            {/* Place Order button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={placing || cart.length === 0}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 10,
                border: 'none',
                background: cart.length === 0 ? '#333' : `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`,
                color: cart.length === 0 ? T.muted : '#000',
                fontSize: 16,
                fontWeight: 800,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
                transition: 'all 0.2s',
              }}
            >
              {placing ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSplit && (
          <SplitBillModal
            total={grandTotal}
            onConfirm={(splits) => { setSplitAmounts(splits); setShowSplit(false); }}
            onClose={() => { setShowSplit(false); if (splitAmounts.length === 0) setPaymentMethod('cash'); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {placedOrder && (
          <ReceiptOverlay
            order={placedOrder}
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            discount={discountAmt}
            total={grandTotal}
            orderType={orderType}
            tableNumber={tableNumber}
            customerName={customerName}
            paymentMethod={paymentMethod}
            restaurantName={restaurantName}
            onNewBill={handleNewBill}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

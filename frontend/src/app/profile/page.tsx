'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface StoredUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt?: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  addOns?: { name: string; price: number }[];
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  restaurantId?: string;
  customerEmail?: string;
}

interface Booking {
  _id: string;
  bookingNumber: string;
  date: string;
  time: string;
  numberOfGuests: number;
  tableNumber?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalBookingAmount: number;
  restaurantId?: string;
}

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  pincode: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const GOLD = '#c8972a';
const BG = '#080808';
const SURFACE = '#141414';
const SURFACE2 = '#1a1a1a';
const BORDER = 'rgba(200,151,42,0.15)';
const TEXT = '#f8f4ed';
const MUTED = '#a89070';
const DIM = '#6b5040';

const TABS = [
  { id: 'orders', label: 'My Orders', icon: '🧾' },
  { id: 'bookings', label: 'My Bookings', icon: '📅' },
  { id: 'wallet', label: 'Wallet & Rewards', icon: '🪙' },
  { id: 'settings', label: 'Account Settings', icon: '⚙️' },
];

const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:    { bg: 'rgba(234,179,8,0.12)',   text: '#fbbf24', border: 'rgba(234,179,8,0.3)' },
  confirmed:  { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  preparing:  { bg: 'rgba(249,115,22,0.12)',  text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  ready:      { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd', border: 'rgba(59,130,246,0.4)' },
  completed:  { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

const BOOKING_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  confirmed:  { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  pending:    { bg: 'rgba(234,179,8,0.12)',   text: '#fbbf24', border: 'rgba(234,179,8,0.3)' },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
  completed:  { bg: 'rgba(168,144,112,0.12)', text: MUTED,     border: 'rgba(168,144,112,0.3)' },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const getTier = (orderCount: number) => {
  if (orderCount >= 20) return { name: 'Gold',   color: '#c8972a', next: null,     pts: 2000, progress: 100 };
  if (orderCount >= 10) return { name: 'Silver', color: '#9ca3af', next: 'Gold',   pts: orderCount * 100, progress: ((orderCount - 10) / 10) * 100 };
  return                       { name: 'Bronze', color: '#cd7f32', next: 'Silver', pts: orderCount * 100, progress: (orderCount / 10) * 100 };
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */
const StatusBadge = ({
  status,
  map,
}: {
  status: string;
  map: Record<string, { bg: string; text: string; border: string }>;
}) => {
  const s = map[status] ?? map['pending'];
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {status}
    </span>
  );
};

const Spinner = () => (
  <div
    style={{
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      border: `2px solid rgba(200,151,42,0.2)`,
      borderTopColor: GOLD,
      animation: 'spin 0.7s linear infinite',
    }}
  />
);

const GoldBtn = ({
  onClick,
  disabled,
  children,
  small,
  danger,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  small?: boolean;
  danger?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? undefined : { scale: 1.03 }}
    whileTap={disabled ? undefined : { scale: 0.97 }}
    style={{
      padding: small ? '7px 16px' : '11px 24px',
      borderRadius: '10px',
      border: danger ? '1px solid rgba(239,68,68,0.4)' : 'none',
      background: disabled
        ? '#2a2a2a'
        : danger
        ? 'rgba(239,68,68,0.1)'
        : `linear-gradient(135deg, #8b5a00, ${GOLD})`,
      color: disabled ? DIM : danger ? '#f87171' : '#fff8e8',
      fontSize: small ? '12px' : '14px',
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      letterSpacing: '0.04em',
      boxShadow: disabled || danger ? 'none' : '0 4px 14px rgba(200,151,42,0.2)',
      transition: 'background 0.2s',
    }}
  >
    {children}
  </motion.button>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: SURFACE2,
  border: `1px solid ${BORDER}`,
  borderRadius: '10px',
  padding: '12px 14px',
  color: TEXT,
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: MUTED,
  fontSize: '11px',
  fontWeight: 600,
  marginBottom: '5px',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
};

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: '16px',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        padding: '18px 22px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
      <h3
        style={{ color: TEXT, fontSize: '15px', fontWeight: 700, margin: 0 }}
      >
        {title}
      </h3>
    </div>
    <div style={{ padding: '22px' }}>{children}</div>
  </div>
);

const MsgBox = ({ type, text }: { type: 'success' | 'error' | 'info'; text: string }) => {
  const colors = {
    success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  text: '#4ade80' },
    error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  text: '#f87171' },
    info:    { bg: 'rgba(200,151,42,0.08)', border: 'rgba(200,151,42,0.25)', text: GOLD },
  }[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '10px 14px',
        borderRadius: '9px',
        fontSize: '13px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      {text}
    </motion.div>
  );
};

/* ─── Orders Tab ─────────────────────────────────────────────────────────── */
function OrdersTab({ user, token }: { user: StoredUser; token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderMsg, setReorderMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/orders?customerEmail=${encodeURIComponent(user.email)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          setOrders([]);
          return;
        }
        const data = await res.json();
        const list: Order[] = Array.isArray(data) ? data : data.orders ?? [];
        // Filter to current user's orders on client side
        setOrders(
          list.filter(
            (o) =>
              !o.customerEmail ||
              o.customerEmail.toLowerCase() === user.email.toLowerCase()
          )
        );
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.email, token]);

  const handleReorder = useCallback(
    (order: Order) => {
      try {
        const CART_KEY = 'restro_os_cart';
        const raw = localStorage.getItem(CART_KEY);
        const carts: Record<string, unknown[]> = raw ? JSON.parse(raw) : {};
        const slug = order.restaurantId ?? 'reorder';
        const existing: Record<string, unknown>[] = Array.isArray(carts[slug])
          ? (carts[slug] as Record<string, unknown>[])
          : [];

        const toAdd = order.items.map((item) => ({
          id: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          addOns: item.addOns ?? [],
        }));

        // Merge with existing cart
        const merged = [...existing];
        toAdd.forEach((newItem) => {
          const idx = merged.findIndex(
            (e) => e.id === newItem.id
          );
          if (idx >= 0) {
            merged[idx] = {
              ...merged[idx],
              quantity: ((merged[idx].quantity as number) || 0) + newItem.quantity,
            };
          } else {
            merged.push(newItem);
          }
        });

        carts[slug] = merged;
        localStorage.setItem(CART_KEY, JSON.stringify(carts));
        setReorderMsg(`${order.items.length} item(s) added to cart!`);
        setTimeout(() => setReorderMsg(null), 3000);
      } catch {
        setReorderMsg('Could not add to cart. Please try again.');
        setTimeout(() => setReorderMsg(null), 3000);
      }
    },
    []
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {reorderMsg && <MsgBox type="success" text={reorderMsg} />}

      {orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            background: SURFACE,
            borderRadius: '16px',
            border: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🍽️</div>
          <p style={{ color: MUTED, fontSize: '16px', margin: '0 0 20px' }}>
            No orders yet. Start ordering!
          </p>
          <Link
            href="/menu"
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: `linear-gradient(135deg, #8b5a00, ${GOLD})`,
              color: '#fff8e8',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        orders.map((order, i) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            {/* Order header */}
            <div
              style={{
                padding: '14px 18px',
                background: 'rgba(200,151,42,0.04)',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    color: GOLD,
                    fontWeight: 800,
                    fontSize: '14px',
                    letterSpacing: '0.04em',
                  }}
                >
                  #{order.orderNumber}
                </span>
                <StatusBadge status={order.status} map={ORDER_STATUS_COLORS} />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: DIM, fontSize: '12px' }}>
                  {fmtDate(order.createdAt)}
                </span>
                <span
                  style={{
                    color: TEXT,
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  {fmt(order.total)}
                </span>
              </div>
            </div>

            {/* Items + action */}
            <div
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: MUTED,
                    fontSize: '13px',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {order.items
                    .map(
                      (item) =>
                        `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`
                    )
                    .join(', ')}
                </p>
              </div>
              {order.status === 'completed' && (
                <GoldBtn small onClick={() => handleReorder(order)}>
                  REORDER
                </GoldBtn>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

/* ─── Bookings Tab ───────────────────────────────────────────────────────── */
function BookingsTab({ user, token }: { user: StoredUser; token: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setBookings([]);
          return;
        }
        const data = await res.json();
        const list: Booking[] = Array.isArray(data) ? data : data.bookings ?? [];
        setBookings(list);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user.email, token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {bookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 20px',
            background: SURFACE,
            borderRadius: '16px',
            border: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>📅</div>
          <p style={{ color: MUTED, fontSize: '16px', margin: '0 0 20px' }}>
            No bookings yet. Book a table!
          </p>
          <Link
            href="/booking"
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: `linear-gradient(135deg, #8b5a00, ${GOLD})`,
              color: '#fff8e8',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            Book a Table
          </Link>
        </div>
      ) : (
        bookings.map((bk, i) => (
          <motion.div
            key={bk._id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                background: 'rgba(200,151,42,0.04)',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: GOLD, fontWeight: 800, fontSize: '14px' }}>
                  #{bk.bookingNumber}
                </span>
                <StatusBadge status={bk.status} map={BOOKING_STATUS_COLORS} />
              </div>
              <span style={{ color: DIM, fontSize: '12px' }}>
                {fmt(bk.totalBookingAmount)}
              </span>
            </div>

            <div
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p style={{ color: DIM, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</p>
                  <p style={{ color: TEXT, fontSize: '14px', fontWeight: 600, margin: 0 }}>
                    {fmtDate(bk.date)}
                  </p>
                </div>
                <div>
                  <p style={{ color: DIM, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</p>
                  <p style={{ color: TEXT, fontSize: '14px', fontWeight: 600, margin: 0 }}>
                    {bk.time}
                  </p>
                </div>
                <div>
                  <p style={{ color: DIM, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Guests</p>
                  <p style={{ color: TEXT, fontSize: '14px', fontWeight: 600, margin: 0 }}>
                    {bk.numberOfGuests}
                  </p>
                </div>
                {bk.tableNumber && (
                  <div>
                    <p style={{ color: DIM, fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Table</p>
                    <p style={{ color: TEXT, fontSize: '14px', fontWeight: 600, margin: 0 }}>
                      #{bk.tableNumber}
                    </p>
                  </div>
                )}
              </div>
              <Link
                href="/booking"
                style={{
                  padding: '7px 16px',
                  borderRadius: '10px',
                  background: 'rgba(200,151,42,0.1)',
                  border: `1px solid rgba(200,151,42,0.3)`,
                  color: GOLD,
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                Book Again
              </Link>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

/* ─── Wallet Tab ─────────────────────────────────────────────────────────── */
function WalletTab({ orderCount }: { orderCount: number }) {
  const tier = getTier(orderCount);
  const [expanded, setExpanded] = useState(false);
  const points = orderCount * 100;
  const nextTierPoints = tier.name === 'Bronze' ? 1000 : tier.name === 'Silver' ? 2000 : 2000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Balance + Points row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
        className="wallet-grid"
      >
        {/* Wallet balance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, #4a3000 0%, #8b5a00 50%, #c8972a 100%)`,
            borderRadius: '16px',
            padding: '24px 22px',
            border: `1px solid rgba(200,151,42,0.4)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
          <p style={{ color: 'rgba(255,248,232,0.7)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Wallet Balance
          </p>
          <p style={{ color: '#fff8e8', fontSize: '32px', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            ₹0.00
          </p>
          <p style={{ color: 'rgba(255,248,232,0.5)', fontSize: '12px', margin: 0 }}>
            Top up coming soon
          </p>
        </motion.div>

        {/* Points balance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            padding: '24px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `rgba(200,151,42,0.06)`,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Points
            </p>
            <span
              style={{
                padding: '2px 9px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: 700,
                background: `${tier.color}18`,
                border: `1px solid ${tier.color}40`,
                color: tier.color,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {tier.name}
            </span>
          </div>
          <p style={{ color: TEXT, fontSize: '32px', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {points.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500, color: MUTED }}>pts</span>
          </p>
          {tier.next && (
            <p style={{ color: DIM, fontSize: '12px', margin: 0 }}>
              {nextTierPoints - points} pts to {tier.next}
            </p>
          )}
          {!tier.next && (
            <p style={{ color: GOLD, fontSize: '12px', margin: 0 }}>
              Maximum tier reached!
            </p>
          )}
        </motion.div>
      </div>

      {/* Tier progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: '14px',
          padding: '20px 22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <p style={{ color: TEXT, fontSize: '14px', fontWeight: 700, margin: 0 }}>
            Loyalty Tier Progress
          </p>
          <span style={{ color: MUTED, fontSize: '12px' }}>
            {orderCount} order{orderCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tier track */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div
            style={{
              height: '8px',
              background: '#1e1e1e',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(tier.progress, 100)}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, #cd7f32, ${tier.color})`,
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['Bronze', 'Silver', 'Gold'].map((t) => {
            const colors: Record<string, string> = { Bronze: '#cd7f32', Silver: '#9ca3af', Gold: '#c8972a' };
            const active = tier.name === t;
            return (
              <div key={t} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: active ? colors[t] : '#2a2a2a',
                    border: `2px solid ${active ? colors[t] : '#333'}`,
                    margin: '0 auto 5px',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: active ? 700 : 400,
                    color: active ? colors[t] : DIM,
                  }}
                >
                  {t}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Transaction history */}
      <SectionCard title="Transaction History" icon="📋">
        <div
          style={{
            textAlign: 'center',
            padding: '32px 20px',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💳</div>
          <p style={{ color: MUTED, fontSize: '14px', margin: 0 }}>
            No transactions yet.
          </p>
        </div>
      </SectionCard>

      {/* How to earn */}
      <motion.div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: '100%',
            padding: '16px 22px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: TEXT, fontSize: '14px', fontWeight: 700 }}>
            🎯 How to earn points?
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            style={{ color: GOLD, fontSize: '16px' }}
          >
            ▼
          </motion.span>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  padding: '0 22px 20px',
                  borderTop: `1px solid ${BORDER}`,
                  paddingTop: '16px',
                }}
              >
                {[
                  { icon: '🛍️', title: 'Place an Order', desc: 'Earn 100 pts for every order you place' },
                  { icon: '📅', title: 'Book a Table', desc: 'Earn 200 pts per confirmed reservation' },
                  { icon: '⭐', title: 'Leave a Review', desc: 'Earn 50 pts for each restaurant review' },
                  { icon: '👥', title: 'Refer a Friend', desc: 'Earn 500 pts when a friend signs up' },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 0',
                      borderBottom: `1px solid rgba(200,151,42,0.06)`,
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <p style={{ color: TEXT, fontSize: '13px', fontWeight: 600, margin: '0 0 2px' }}>
                        {item.title}
                      </p>
                      <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ─── Settings Tab ───────────────────────────────────────────────────────── */
function SettingsTab({
  user,
  token,
  onLogout,
}: {
  user: StoredUser;
  token: string;
  onLogout: () => void;
}) {
  // Password state
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addingAddr, setAddingAddr] = useState(false);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPin, setAddrPin] = useState('');

  // Load addresses from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('restro_saved_addresses');
      if (raw) setAddresses(JSON.parse(raw));
    } catch {}
  }, []);

  const saveAddresses = (list: SavedAddress[]) => {
    setAddresses(list);
    localStorage.setItem('restro_saved_addresses', JSON.stringify(list));
  };

  const handleAddAddress = () => {
    if (!addrStreet.trim() || !addrCity.trim()) return;
    const newAddr: SavedAddress = {
      id: Date.now().toString(),
      label: addrLabel.trim() || 'Home',
      street: addrStreet.trim(),
      city: addrCity.trim(),
      pincode: addrPin.trim(),
    };
    saveAddresses([...addresses, newAddr]);
    setAddrLabel(''); setAddrStreet(''); setAddrCity(''); setAddrPin('');
    setAddingAddr(false);
  };

  const handleDeleteAddress = (id: string) => {
    saveAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (newPw.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: oldPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwMsg({ type: 'error', text: data.error || 'Failed to update password.' }); return; }
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } catch {
      setPwMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* User info */}
      <SectionCard title="Your Information" icon="👤">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}
          className="settings-grid"
        >
          {[
            { label: 'Full Name', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Phone', value: user.phone || 'Not set' },
            { label: 'Role', value: user.role || 'Customer' },
          ].map((f) => (
            <div key={f.label}>
              <p style={{ ...labelStyle, marginBottom: '4px' }}>{f.label}</p>
              <p
                style={{
                  color: f.value === 'Not set' ? DIM : TEXT,
                  fontSize: '14px',
                  margin: 0,
                  padding: '10px 14px',
                  background: SURFACE2,
                  borderRadius: '8px',
                  border: `1px solid rgba(200,151,42,0.08)`,
                }}
              >
                {f.value}
              </p>
            </div>
          ))}
        </div>
        <p style={{ color: DIM, fontSize: '12px', margin: '12px 0 0' }}>
          To update your name or phone, use the edit profile feature above.
        </p>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Change Password" icon="🔒">
        <form
          onSubmit={handleChangePassword}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div>
            <label style={labelStyle}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                required
                placeholder="Enter current password"
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '14px',
                }}
              >
                {showOld ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
            className="settings-grid"
          >
            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  placeholder="Min. 8 chars"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '14px',
                  }}
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                placeholder="Repeat new password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
            </div>
          </div>

          {pwMsg && <MsgBox type={pwMsg.type} text={pwMsg.text} />}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GoldBtn disabled={pwLoading}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </GoldBtn>
          </div>
        </form>
      </SectionCard>

      {/* Saved Addresses */}
      <SectionCard title="Saved Addresses" icon="📍">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {addresses.length === 0 && !addingAddr && (
            <p style={{ color: MUTED, fontSize: '14px', margin: '0 0 10px' }}>
              No saved addresses yet.
            </p>
          )}

          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: SURFACE2,
                borderRadius: '10px',
                border: `1px solid rgba(200,151,42,0.08)`,
                gap: '12px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      background: `rgba(200,151,42,0.12)`,
                      color: GOLD,
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '5px',
                    }}
                  >
                    {addr.label}
                  </span>
                </div>
                <p style={{ color: TEXT, fontSize: '13px', margin: '0 0 2px' }}>{addr.street}</p>
                <p style={{ color: MUTED, fontSize: '12px', margin: 0 }}>
                  {addr.city}{addr.pincode ? ` — ${addr.pincode}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAddress(addr.id)}
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                  borderRadius: '7px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Delete
              </button>
            </div>
          ))}

          <AnimatePresence>
            {addingAddr && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  overflow: 'hidden',
                  background: SURFACE2,
                  borderRadius: '10px',
                  border: `1px solid rgba(200,151,42,0.2)`,
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                  className="settings-grid"
                >
                  <div>
                    <label style={labelStyle}>Label</label>
                    <input
                      type="text"
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="Home / Work / Other"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = BORDER)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="City"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = GOLD)}
                      onBlur={(e) => (e.target.style.borderColor = BORDER)}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Street Address</label>
                  <input
                    type="text"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    placeholder="Street, Apartment, Building"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Pincode</label>
                  <input
                    type="text"
                    value={addrPin}
                    onChange={(e) => setAddrPin(e.target.value)}
                    placeholder="6-digit pincode"
                    style={{ ...inputStyle, width: '50%' }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <GoldBtn small onClick={handleAddAddress}>
                    Save Address
                  </GoldBtn>
                  <button
                    onClick={() => setAddingAddr(false)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: 'none',
                      border: `1px solid ${BORDER}`,
                      color: MUTED,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!addingAddr && (
            <button
              onClick={() => setAddingAddr(true)}
              style={{
                padding: '10px',
                borderRadius: '10px',
                background: 'none',
                border: `1px dashed rgba(200,151,42,0.3)`,
                color: GOLD,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              + Add New Address
            </button>
          )}
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div
        style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '14px',
          padding: '20px 22px',
        }}
      >
        <h3 style={{ color: '#f87171', fontSize: '14px', fontWeight: 700, margin: '0 0 6px' }}>
          Danger Zone
        </h3>
        <p style={{ color: MUTED, fontSize: '13px', margin: '0 0 16px' }}>
          Logging out will clear your session data from this device.
        </p>
        <GoldBtn danger onClick={onLogout}>
          Logout
        </GoldBtn>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'wallet' | 'settings'>('orders');
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem('restro-token') || localStorage.getItem('token') || '';
    const storedUserRaw =
      localStorage.getItem('restro-user') || localStorage.getItem('user') || '';

    if (!storedToken && !storedUserRaw) {
      router.push('/login');
      return;
    }

    let parsedUser: StoredUser | null = null;
    try {
      if (storedUserRaw) parsedUser = JSON.parse(storedUserRaw);
    } catch {}

    // If we only have a token but no user, try decoding or fetching
    if (!parsedUser && storedToken) {
      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.email) {
            setUser(data);
            setToken(storedToken);
          } else {
            router.push('/login');
          }
        })
        .catch(() => router.push('/login'));
      return;
    }

    if (!parsedUser) {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    setToken(storedToken);
  }, [router]);

  // Fetch order count for tier calculation
  useEffect(() => {
    if (!user || !token) return;
    fetch(`/api/orders?customerEmail=${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data.orders ?? [];
        setOrderCount(
          list.filter(
            (o: Order) =>
              !o.customerEmail ||
              o.customerEmail.toLowerCase() === user.email.toLowerCase()
          ).length
        );
      })
      .catch(() => {});
  }, [user, token]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('restro-token');
    localStorage.removeItem('token');
    localStorage.removeItem('restro-user');
    localStorage.removeItem('user');
    router.push('/');
  }, [router]);

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const tier = getTier(orderCount);
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: '80px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .wallet-grid { grid-template-columns: 1fr !important; }
          .settings-grid { grid-template-columns: 1fr !important; }
          .profile-header-flex { flex-direction: column !important; align-items: flex-start !important; }
          .tab-bar { gap: 4px !important; }
          .tab-btn span.tab-label { display: none; }
        }
        @media (max-width: 768px) {
          .tab-bar { overflow-x: auto; }
        }
      `}</style>

      {/* ── Profile Header ── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #0c0802 0%, #0e0b04 60%, #080808 100%)',
          borderBottom: `1px solid ${BORDER}`,
          paddingTop: '28px',
        }}
      >
        <div
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          {/* Back link */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: DIM,
              fontSize: '13px',
              textDecoration: 'none',
              marginBottom: '24px',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={(e) => (e.currentTarget.style.color = DIM)}
          >
            ← Back to home
          </Link>

          {/* Avatar + info */}
          <div
            className="profile-header-flex"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '22px',
              paddingBottom: '28px',
            }}
          >
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{
                width: '86px',
                height: '86px',
                borderRadius: '50%',
                flexShrink: 0,
                background: `linear-gradient(135deg, #6b3d00, ${GOLD})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                fontWeight: 900,
                color: '#fff8e8',
                boxShadow: `0 8px 32px rgba(200,151,42,0.3)`,
                border: `3px solid rgba(200,151,42,0.35)`,
                position: 'relative',
              }}
            >
              {user.name.charAt(0).toUpperCase()}
              {/* Tier indicator dot */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: tier.color,
                  border: '2px solid #080808',
                }}
              />
            </motion.div>

            {/* Name / email / meta */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              style={{ flex: 1 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '4px',
                }}
              >
                <h1
                  style={{
                    color: TEXT,
                    fontSize: '24px',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {user.name}
                </h1>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: `${tier.color}18`,
                    border: `1px solid ${tier.color}40`,
                    color: tier.color,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {tier.name}
                </span>
              </div>
              <p style={{ color: MUTED, fontSize: '14px', margin: '0 0 6px' }}>
                {user.email}
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {joinDate && (
                  <span style={{ color: DIM, fontSize: '12px' }}>
                    Member since {joinDate}
                  </span>
                )}
                {user.phone && (
                  <span style={{ color: DIM, fontSize: '12px' }}>
                    {user.phone}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 }}
              style={{
                display: 'flex',
                gap: '16px',
                flexShrink: 0,
              }}
            >
              {[
                { label: 'Orders', value: orderCount.toString() },
                { label: 'Points', value: `${orderCount * 100}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    textAlign: 'center',
                    padding: '10px 16px',
                    background: 'rgba(200,151,42,0.07)',
                    borderRadius: '10px',
                    border: `1px solid rgba(200,151,42,0.15)`,
                  }}
                >
                  <p
                    style={{
                      color: GOLD,
                      fontSize: '22px',
                      fontWeight: 800,
                      margin: '0 0 2px',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      color: MUTED,
                      fontSize: '11px',
                      fontWeight: 600,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Tab bar ── */}
          <div
            className="tab-bar"
            style={{
              display: 'flex',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  style={{
                    padding: '11px 18px',
                    background: active ? 'rgba(200,151,42,0.12)' : 'transparent',
                    border: 'none',
                    borderBottom: active
                      ? `2px solid ${GOLD}`
                      : '2px solid transparent',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    color: active ? GOLD : MUTED,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s, background 0.2s',
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div
        style={{
          maxWidth: '860px',
          margin: '28px auto 0',
          padding: '0 20px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'orders' && (
              <OrdersTab user={user} token={token} />
            )}
            {activeTab === 'bookings' && (
              <BookingsTab user={user} token={token} />
            )}
            {activeTab === 'wallet' && (
              <WalletTab orderCount={orderCount} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab user={user} token={token} onLogout={handleLogout} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

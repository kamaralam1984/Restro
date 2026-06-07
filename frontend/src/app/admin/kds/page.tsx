'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  tableNumber?: string | number;
  orderType?: 'dine-in' | 'delivery' | 'takeaway';
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
}

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function formatElapsed(createdAt: string): string {
  const mins = getElapsedMinutes(createdAt);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1 min ago';
  return `${mins} min ago`;
}

function getTimerColor(createdAt: string): string {
  const mins = getElapsedMinutes(createdAt);
  if (mins < 10) return '#22c55e';
  if (mins <= 20) return '#eab308';
  return '#ef4444';
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 500);
  } catch (_) {
    // AudioContext not available
  }
}

const GOLD = '#c8972a';
const BG = '#080808';
const CARD_BG = '#111111';
const BORDER = '#1e1e1e';
const COLUMN_BG = '#0d0d0d';

const columnDefs = [
  { key: 'queue', label: 'QUEUE', statuses: ['pending'] as Order['status'][], color: '#3b82f6' },
  { key: 'preparing', label: 'PREPARING', statuses: ['confirmed', 'preparing'] as Order['status'][], color: GOLD },
  { key: 'ready', label: 'READY', statuses: ['ready'] as Order['status'][], color: '#22c55e' },
];

function orderTypeBadge(orderType?: string) {
  const map: Record<string, { label: string; color: string }> = {
    'dine-in': { label: 'DINE-IN', color: '#8b5cf6' },
    delivery: { label: 'DELIVERY', color: '#f97316' },
    takeaway: { label: 'TAKEAWAY', color: '#06b6d4' },
  };
  const t = orderType ? map[orderType] : undefined;
  if (!t) return null;
  return (
    <span
      style={{
        background: t.color + '22',
        color: t.color,
        border: `1px solid ${t.color}55`,
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}
    >
      {t.label}
    </span>
  );
}

function getNextStatus(status: Order['status']): { label: string; next: string } | null {
  if (status === 'pending') return { label: 'START COOKING', next: 'preparing' };
  if (status === 'confirmed') return { label: 'START COOKING', next: 'preparing' };
  if (status === 'preparing') return { label: 'MARK READY', next: 'ready' };
  if (status === 'ready') return { label: 'COMPLETE', next: 'completed' };
  return null;
}

function getActionColor(status: Order['status']): string {
  if (status === 'pending' || status === 'confirmed') return '#3b82f6';
  if (status === 'preparing') return GOLD;
  if (status === 'ready') return '#22c55e';
  return GOLD;
}

interface OrderCardProps {
  order: Order;
  onAction: (id: string, nextStatus: string) => void;
  updating: string | null;
  tick: number;
}

function OrderCard({ order, onAction, updating, tick }: OrderCardProps) {
  const action = getNextStatus(order.status);
  const timerColor = getTimerColor(order.createdAt);
  const elapsed = formatElapsed(order.createdAt);
  const mins = getElapsedMinutes(order.createdAt);
  const isUpdating = updating === order._id;
  const actionColor = getActionColor(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: '14px 16px',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Colored top bar based on timer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: timerColor,
          borderRadius: '10px 10px 0 0',
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: GOLD, fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>
              #{order.orderNumber}
            </span>
            {order.tableNumber && (
              <span
                style={{
                  background: '#1a1a1a',
                  border: `1px solid ${BORDER}`,
                  color: '#aaa',
                  borderRadius: 4,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Table {order.tableNumber}
              </span>
            )}
          </div>
          <div style={{ color: '#666', fontSize: 12, marginTop: 3 }}>
            {order.customerName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {orderTypeBadge(order.orderType)}
          <div
            style={{
              color: timerColor,
              fontSize: 13,
              fontWeight: 700,
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              justifyContent: 'flex-end',
            }}
          >
            <span style={{ fontSize: 10 }}>⏱</span>
            {elapsed}
            {mins >= 20 && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ color: '#ef4444', fontSize: 10 }}
              >
                ●
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* Items list */}
      <div
        style={{
          background: '#0a0a0a',
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: '8px 10px',
          marginBottom: 12,
        }}
      >
        {order.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '3px 0',
              borderBottom: i < order.items.length - 1 ? `1px solid ${BORDER}` : 'none',
            }}
          >
            <span style={{ color: '#e0e0e0', fontSize: 13, fontWeight: 500 }}>{item.name}</span>
            <span
              style={{
                background: GOLD + '22',
                color: GOLD,
                borderRadius: 4,
                padding: '1px 8px',
                fontSize: 12,
                fontWeight: 700,
                minWidth: 24,
                textAlign: 'center',
              }}
            >
              ×{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {action && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onAction(order._id, action.next)}
          disabled={isUpdating}
          style={{
            width: '100%',
            padding: '10px 0',
            background: isUpdating ? '#1a1a1a' : actionColor + '22',
            border: `1.5px solid ${isUpdating ? BORDER : actionColor}`,
            borderRadius: 7,
            color: isUpdating ? '#555' : actionColor,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: 1.2,
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
        >
          {isUpdating ? '...' : action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

interface ColumnProps {
  label: string;
  color: string;
  orders: Order[];
  onAction: (id: string, nextStatus: string) => void;
  updating: string | null;
  tick: number;
}

function Column({ label, color, orders, onAction, updating, tick }: ColumnProps) {
  return (
    <div
      style={{
        flex: 1,
        background: COLUMN_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${BORDER}`,
          background: color + '11',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span
          style={{
            background: color + '33',
            color,
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          scrollbarWidth: 'thin',
          scrollbarColor: `${BORDER} transparent`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center',
                color: '#333',
                fontSize: 13,
                paddingTop: 32,
                userSelect: 'none',
              }}
            >
              — empty —
            </motion.div>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onAction={onAction}
                updating={updating}
                tick={tick}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [restaurantName, setRestaurantName] = useState('KVL Restaurant');
  const [tick, setTick] = useState(0);
  const prevCountRef = useRef(0);
  const soundEnabledRef = useRef(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    try {
      const adminRaw = localStorage.getItem('admin');
      if (adminRaw) {
        const admin = JSON.parse(adminRaw);
        if (admin?.restaurantName) setRestaurantName(admin.restaurantName);
        else if (admin?.name) setRestaurantName(admin.name);
      }
    } catch (_) {}
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all: Order[] = Array.isArray(data) ? data : data.orders || [];
      const active = all.filter((o) =>
        ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
      );
      const activeCount = active.filter((o) =>
        ['pending', 'confirmed', 'preparing'].includes(o.status)
      ).length;
      if (activeCount > prevCountRef.current && soundEnabledRef.current) {
        playBeep();
      }
      prevCountRef.current = activeCount;
      setOrders(active);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    pollIntervalRef.current = setInterval(fetchOrders, 5000);
    tickIntervalRef.current = setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [fetchOrders]);

  const handleAction = async (orderId: string, nextStatus: string) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleSound = () => setSoundEnabled((s) => !s);

  // Stats
  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'preparing'].includes(o.status)
  );
  const totalActive = activeOrders.length;
  const avgWait =
    activeOrders.length > 0
      ? Math.round(
          activeOrders.reduce((sum, o) => sum + getElapsedMinutes(o.createdAt), 0) /
            activeOrders.length
        )
      : 0;
  const longestWait =
    activeOrders.length > 0
      ? Math.max(...activeOrders.map((o) => getElapsedMinutes(o.createdAt)))
      : 0;

  const totalAllActive = orders.length;
  const isKitchenClear = totalAllActive === 0 && !loading;

  const getColumnOrders = (statuses: Order['status'][]) =>
    orders.filter((o) => statuses.includes(o.status));

  return (
    <div
      style={{
        background: BG,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: '#e0e0e0',
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: '#0d0d0d',
          borderBottom: `1px solid ${BORDER}`,
          padding: '0 24px',
          height: 62,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🍳</span>
            <div>
              <div
                style={{
                  color: GOLD,
                  fontWeight: 900,
                  fontSize: 15,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                Kitchen Display System
              </div>
              <div style={{ color: '#555', fontSize: 11, letterSpacing: 0.5 }}>
                {restaurantName}
              </div>
            </div>
          </div>
          <div
            style={{
              background: '#1a1a1a',
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 12,
              color: '#888',
            }}
          >
            {totalAllActive} active order{totalAllActive !== 1 ? 's' : ''}
          </div>
          {error && (
            <div
              style={{
                background: '#ef444422',
                border: '1px solid #ef444455',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                color: '#ef4444',
              }}
            >
              ⚠ {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Sound toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleSound}
            style={{
              background: soundEnabled ? GOLD + '22' : '#1a1a1a',
              border: `1px solid ${soundEnabled ? GOLD + '55' : BORDER}`,
              borderRadius: 7,
              padding: '7px 14px',
              color: soundEnabled ? GOLD : '#555',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: 0.5,
            }}
          >
            <motion.span
              animate={soundEnabled ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: 10 }}
            >
              ●
            </motion.span>
            SOUND {soundEnabled ? 'ON' : 'OFF'}
          </motion.button>

          {/* Fullscreen button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFullscreen}
            style={{
              background: '#1a1a1a',
              border: `1px solid ${BORDER}`,
              borderRadius: 7,
              padding: '7px 14px',
              color: '#888',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            ⛶ FULLSCREEN
          </motion.button>
        </div>
      </div>

      {/* STATS BAR */}
      <div
        style={{
          background: '#0a0a0a',
          borderBottom: `1px solid ${BORDER}`,
          padding: '8px 24px',
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {[
          { label: 'ACTIVE ORDERS', value: totalActive, color: '#3b82f6' },
          { label: 'AVG WAIT', value: totalActive > 0 ? `${avgWait} min` : '—', color: GOLD },
          {
            label: 'LONGEST WAITING',
            value: totalActive > 0 ? `${longestWait} min` : '—',
            color: longestWait >= 20 ? '#ef4444' : longestWait >= 10 ? '#eab308' : '#22c55e',
          },
        ].map((stat) => (
          <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                color: '#444',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              {stat.label}
            </span>
            <span
              style={{
                color: stat.color,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              {stat.value}
            </span>
          </div>
        ))}

        {/* Live pulse indicator */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
          <span style={{ color: '#444', fontSize: 10, letterSpacing: 1 }}>LIVE · 5s</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: 16, display: 'flex', gap: 14, minHeight: 0, overflow: 'hidden' }}>
        {loading && orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 16,
              color: '#444',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: 36,
                height: 36,
                border: `3px solid ${BORDER}`,
                borderTopColor: GOLD,
                borderRadius: '50%',
              }}
            />
            <span style={{ fontSize: 14, letterSpacing: 1 }}>Loading orders...</span>
          </motion.div>
        ) : isKitchenClear ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{ fontSize: 64 }}
            >
              ✓
            </motion.div>
            <div
              style={{
                color: '#22c55e',
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Kitchen is clear
            </div>
            <div style={{ color: '#333', fontSize: 14 }}>
              No active orders right now
            </div>
          </motion.div>
        ) : (
          columnDefs.map((col) => (
            <Column
              key={col.key}
              label={col.label}
              color={col.color}
              orders={getColumnOrders(col.statuses)}
              onAction={handleAction}
              updating={updating}
              tick={tick}
            />
          ))
        )}
      </div>
    </div>
  );
}

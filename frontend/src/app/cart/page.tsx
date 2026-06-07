'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, Minus, Trash2, ArrowRight, Tag,
  Truck, X, Check, AlertCircle, ShoppingBag, ArrowLeft,
} from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import api from '@/services/api';

const gold = '#c8972a';
const goldLight = '#f0c060';
const FREE_DELIVERY_THRESHOLD = 500;

function CartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCartItems, getTotalPrice, updateQuantity, removeFromCart, clearCart, activeCartSlug } = useCart();

  const slugFromUrl = searchParams.get('restaurant') ?? undefined;
  const restaurantSlug = slugFromUrl ?? activeCartSlug;

  const cartItems = getCartItems(restaurantSlug);
  const [taxRate, setTaxRate] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const deliveryCharge = 50;

  const getItemTotal = (item: CartItem) =>
    item.price * item.quantity + (item.addOns || []).reduce((s, a) => s + a.price * item.quantity, 0);

  const subtotal = cartItems.reduce((s, i) => s + getItemTotal(i), 0);
  const gstAmount = Math.round(subtotal * (taxRate / 100));
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryCharge;
  const total = subtotal + gstAmount + deliveryFee - discount;
  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const freeDeliveryPct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    if (!restaurantSlug || restaurantSlug === 'home') { setTaxRate(0); return; }
    api.get<{ taxRate?: number }>(`/restaurants/by-slug/${restaurantSlug}`)
      .then(d => setTaxRate(typeof d.taxRate === 'number' ? d.taxRate : 0))
      .catch(() => setTaxRate(0));
  }, [restaurantSlug]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    setApplying(true);
    setTimeout(() => {
      const CODES: Record<string, number> = { WELCOME10: 10, SAVE20: 20, FIRST50: 50, FLAT100: 100 };
      const code = couponCode.toUpperCase().trim();
      if (CODES[code]) {
        const amt = Math.min(CODES[code], subtotal * 0.3);
        setDiscount(amt); setAppliedCoupon(code);
        toast.success(`Coupon "${code}" applied — saved ${fmt(amt)}!`, {
          style: { background: '#141414', color: '#f8f4ed', border: '1px solid rgba(76,175,80,0.3)' },
        });
      } else {
        toast.error('Invalid coupon code', {
          style: { background: '#141414', color: '#f8f4ed', border: '1px solid rgba(220,38,38,0.3)' },
        });
      }
      setApplying(false);
    }, 500);
  };

  const handleCheckout = () => {
    if (!restaurantSlug) { toast.error('No restaurant selected'); return; }
    router.push(`/checkout?restaurant=${encodeURIComponent(restaurantSlug)}`);
  };

  /* ── Empty / no-slug state ── */
  if (cartItems.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: '440px' }}>
        <motion.div
          animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{
            width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 28px',
            background: 'radial-gradient(circle, rgba(200,151,42,0.12), rgba(200,151,42,0.03))',
            border: '2px solid rgba(200,151,42,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <ShoppingCart size={48} color="rgba(200,151,42,0.45)" />
        </motion.div>
        <h2 style={{ color: '#f8f4ed', fontSize: '26px', fontWeight: 900, margin: '0 0 12px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#a89070', fontSize: '15px', lineHeight: 1.7, margin: '0 0 32px' }}>
          Browse our menu and add items to start your order.
        </p>
        <motion.button
          onClick={() => router.push(restaurantSlug && restaurantSlug !== 'home' ? `/menu?restaurant=${encodeURIComponent(restaurantSlug)}` : '/')}
          whileHover={{ scale: 1.04, boxShadow: '0 10px 36px rgba(240,192,96,0.35)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: `linear-gradient(135deg, #8b5a00, ${gold}, ${goldLight})`,
            color: '#080808', border: 'none', borderRadius: '14px',
            padding: '14px 36px', fontSize: '15px', fontWeight: 800,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(200,151,42,0.3)',
          }}>
          <ShoppingBag size={18} /> Browse Menu
        </motion.button>
      </motion.div>
    </div>
  );

  /* ── Filled cart ── */
  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: '28px 0 70px' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#141414', color: '#f8f4ed', border: '1px solid rgba(200,151,42,0.2)' } }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Back */}
        <button onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#a89070', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = goldLight)}
          onMouseLeave={e => (e.currentTarget.style.color = '#a89070')}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#f8f4ed', fontSize: '26px', fontWeight: 900, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={24} color={gold} /> Your Cart
            </h1>
            <p style={{ color: '#a89070', fontSize: '13px', margin: 0 }}>
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {fmt(subtotal)} subtotal
            </p>
          </div>
          <motion.button
            onClick={() => {
              if (confirm('Clear all items from cart?')) {
                if (restaurantSlug) clearCart(restaurantSlug);
                toast.success('Cart cleared');
              }
            }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '8px 14px', color: '#e05555', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Trash2 size={14} /> Clear Cart
          </motion.button>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }} className="cart-grid">

          {/* ── Items ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence initial={false}>
              {cartItems.map((item, i) => {
                const key = `${item.id}-${JSON.stringify(item.addOns || [])}-${item.customizations || ''}`;
                const itemTotal = getItemTotal(item);
                return (
                  <motion.div key={key}
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      background: '#141414', border: '1px solid rgba(200,151,42,0.13)',
                      borderRadius: '16px', padding: '16px 18px',
                      display: 'flex', gap: '14px',
                    }}
                    whileHover={{ borderColor: 'rgba(200,151,42,0.28)' }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#1c1c1c', flexShrink: 0, border: '1px solid rgba(200,151,42,0.1)' }}>
                      {item.image
                        ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={24} color="rgba(200,151,42,0.3)" />
                          </div>
                      }
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                        <h3 style={{ color: '#f8f4ed', fontSize: '15px', fontWeight: 700, margin: 0 }}>{item.name}</h3>
                        <motion.button onClick={() => restaurantSlug && removeFromCart(item.id, restaurantSlug)}
                          whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '7px', padding: '5px', cursor: 'pointer', color: '#e05555', display: 'flex', flexShrink: 0 }}>
                          <Trash2 size={13} />
                        </motion.button>
                      </div>

                      <p style={{ color: gold, fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>{fmt(item.price)} each</p>

                      {item.addOns && item.addOns.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                          {item.addOns.map((a, idx) => (
                            <span key={idx} style={{ background: 'rgba(200,151,42,0.08)', border: '1px solid rgba(200,151,42,0.18)', color: '#a89070', borderRadius: '5px', padding: '2px 7px', fontSize: '11px' }}>
                              +{a.name} ({fmt(a.price)})
                            </span>
                          ))}
                        </div>
                      )}

                      {item.customizations && (
                        <p style={{ color: '#6b5040', fontSize: '11px', fontStyle: 'italic', margin: '0 0 6px' }}>"{item.customizations}"</p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        {/* Qty controls */}
                        <div style={{ display: 'flex', alignItems: 'center', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                          <motion.button
                            onClick={() => restaurantSlug && updateQuantity(item.id, item.quantity - 1, restaurantSlug)}
                            whileTap={{ scale: 0.85 }}
                            style={{
                              width: '28px', height: '28px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                              background: item.quantity === 1 ? 'rgba(220,38,38,0.15)' : 'transparent',
                              color: item.quantity === 1 ? '#e05555' : '#f8f4ed',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                            {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={13} />}
                          </motion.button>
                          <span style={{ width: '30px', textAlign: 'center', color: '#f8f4ed', fontWeight: 800, fontSize: '14px' }}>{item.quantity}</span>
                          <motion.button
                            onClick={() => restaurantSlug && updateQuantity(item.id, item.quantity + 1, restaurantSlug)}
                            whileTap={{ scale: 0.85 }}
                            style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', background: gold, color: '#080808', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={13} />
                          </motion.button>
                        </div>

                        {/* Item total */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#6b5040', fontSize: '11px', margin: '0 0 1px' }}>Item Total</p>
                          <p style={{ color: goldLight, fontSize: '17px', fontWeight: 900, margin: 0 }}>{fmt(itemTotal)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Summary ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.18)', borderRadius: '18px', overflow: 'hidden', position: 'sticky', top: '90px' }}>

            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(200,151,42,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(200,151,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={15} color={gold} />
              </div>
              <h2 style={{ color: '#f8f4ed', fontSize: '16px', fontWeight: 800, margin: 0 }}>Order Summary</h2>
            </div>

            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Free delivery progress */}
              <div style={{ background: 'rgba(200,151,42,0.06)', border: '1px solid rgba(200,151,42,0.14)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a89070', fontSize: '12px', fontWeight: 600 }}>
                    <Truck size={13} color={toFreeDelivery === 0 ? '#81c784' : gold} />
                    {toFreeDelivery === 0 ? 'Free Delivery Unlocked!' : `Add ${fmt(toFreeDelivery)} for free delivery`}
                  </span>
                  <span style={{ color: toFreeDelivery === 0 ? '#81c784' : goldLight, fontSize: '12px', fontWeight: 700 }}>
                    {toFreeDelivery === 0 ? '✓' : `${Math.round(freeDeliveryPct)}%`}
                  </span>
                </div>
                <div style={{ height: '5px', background: 'rgba(200,151,42,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeDeliveryPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: toFreeDelivery === 0 ? '#81c784' : `linear-gradient(90deg, ${gold}, ${goldLight})`, borderRadius: '3px' }}
                  />
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a89070', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Tag size={11} /> Coupon Code
                </label>
                <AnimatePresence mode="wait">
                  {!appliedCoupon ? (
                    <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                        placeholder="WELCOME10" onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        style={{ flex: 1, background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)', borderRadius: '10px', padding: '10px 12px', color: '#f8f4ed', fontSize: '13px', outline: 'none' }}
                        onFocus={e => (e.target.style.borderColor = gold)}
                        onBlur={e => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')} />
                      <motion.button onClick={handleApplyCoupon} disabled={applying}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        style={{ padding: '10px 16px', background: gold, border: 'none', borderRadius: '10px', color: '#080808', fontSize: '13px', fontWeight: 700, cursor: applying ? 'wait' : 'pointer' }}>
                        {applying ? '...' : 'Apply'}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div key="applied" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={15} color="#81c784" />
                        <span style={{ color: '#81c784', fontSize: '13px', fontWeight: 600 }}>{appliedCoupon} — Saved {fmt(discount)}</span>
                      </div>
                      <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#81c784', display: 'flex' }}>
                        <X size={15} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!appliedCoupon && (
                  <p style={{ color: '#6b5040', fontSize: '11px', marginTop: '5px' }}>Try: WELCOME10 · SAVE20 · FIRST50</p>
                )}
              </div>

              {/* Price breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {[
                  { label: 'Subtotal', val: fmt(subtotal) },
                  { label: `GST (${taxRate}%)`, val: fmt(gstAmount) },
                  { label: 'Delivery', val: deliveryFee === 0 ? <span style={{ color: '#81c784', fontWeight: 600 }}>FREE</span> : fmt(deliveryFee), icon: <Truck size={12} /> },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#a89070', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>{row.icon}{row.label}</span>
                    <span style={{ color: '#f8f4ed', fontSize: '13px' }}>{row.val}</span>
                  </div>
                ))}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#81c784', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12} /> Coupon Discount</span>
                    <span style={{ color: '#81c784', fontSize: '13px', fontWeight: 700 }}>−{fmt(discount)}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid rgba(200,151,42,0.15)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f8f4ed', fontSize: '16px', fontWeight: 700 }}>Total</span>
                  <span style={{ color: goldLight, fontSize: '26px', fontWeight: 900 }}>{fmt(total)}</span>
                </div>
              </div>

              {/* Checkout */}
              <motion.button onClick={handleCheckout}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(240,192,96,0.35)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '15px',
                  background: `linear-gradient(135deg, #8b5a00, ${gold}, ${goldLight})`,
                  color: '#080808', border: 'none', borderRadius: '13px', fontSize: '15px', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 20px rgba(200,151,42,0.3)',
                }}>
                Proceed to Checkout <ArrowRight size={17} />
              </motion.button>

              <button
                onClick={() => router.push(restaurantSlug && restaurantSlug !== 'home' ? `/menu?restaurant=${encodeURIComponent(restaurantSlug)}` : '/')}
                style={{ background: 'none', border: 'none', color: '#a89070', fontSize: '13px', cursor: 'pointer', textAlign: 'center', padding: '4px', width: '100%' }}
                onMouseEnter={e => (e.currentTarget.style.color = goldLight)}
                onMouseLeave={e => (e.currentTarget.style.color = '#a89070')}>
                ← Continue Shopping
              </button>

            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}

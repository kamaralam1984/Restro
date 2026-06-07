'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

const gold = '#c8972a';
const goldLight = '#f0c060';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { restaurant } = useRestaurantPage();
  const { getCartItems, removeFromCart, updateQuantity, getTotalPrice, activeCartSlug } = useCart();

  // Use page restaurant slug, fall back to last active slug
  const restaurantSlug = restaurant?.slug ?? activeCartSlug;
  const cartItems = getCartItems(restaurantSlug);
  const totalPrice = getTotalPrice(restaurantSlug);
  const totalCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>
          {/* Overlay */}
          <motion.div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Drawer */}
          <motion.div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: '100%',
              width: '100%',
              maxWidth: '420px',
              background: '#111111',
              borderLeft: '1px solid rgba(200,151,42,0.22)',
              boxShadow: '-12px 0 60px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* ── Header ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              background: '#0a0a0a',
              borderBottom: '1px solid rgba(200,151,42,0.15)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8b5a00, #c8972a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShoppingBag size={18} color="#080808" />
                </div>
                <div>
                  <h2 style={{ color: '#f8f4ed', fontSize: '17px', fontWeight: 800, margin: 0 }}>Your Cart</h2>
                  {totalCount > 0 && (
                    <p style={{ color: '#a89070', fontSize: '12px', margin: 0 }}>
                      {totalCount} {totalCount === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: 'rgba(200,151,42,0.08)',
                  border: '1px solid rgba(200,151,42,0.2)',
                  color: gold, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* ── Items ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {cartItems.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', paddingTop: '60px' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(200,151,42,0.07)',
                    border: '2px solid rgba(200,151,42,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShoppingBag size={34} color="rgba(200,151,42,0.35)" />
                  </div>
                  <p style={{ color: '#a89070', fontSize: '15px', fontWeight: 500, margin: 0 }}>Your cart is empty</p>
                  <p style={{ color: '#6b5040', fontSize: '13px', margin: 0 }}>Add items to get started</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <AnimatePresence initial={false}>
                    {cartItems.map((item, i) => {
                      const itemTotal = (item.price + (item.addOns ?? []).reduce((s, a) => s + a.price, 0)) * item.quantity;
                      return (
                        <motion.div
                          key={`${item.id}-${JSON.stringify(item.addOns)}-${item.customizations}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, padding: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          style={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(200,151,42,0.1)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            marginBottom: '8px',
                          }}
                        >
                          {/* Thumbnail */}
                          <div style={{
                            width: '52px', height: '52px', borderRadius: '10px',
                            overflow: 'hidden', flexShrink: 0,
                            background: '#242424',
                            border: '1px solid rgba(200,151,42,0.12)',
                          }}>
                            {item.image ? (
                              <Image src={item.image} alt={item.name} width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShoppingBag size={20} color="rgba(200,151,42,0.3)" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <h3 style={{
                                color: '#f8f4ed', fontWeight: 700, fontSize: '14px',
                                margin: '0 0 2px', overflow: 'hidden',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                              }}>
                                {item.name}
                              </h3>
                              <motion.button
                                onClick={() => restaurantSlug && removeFromCart(item.id, restaurantSlug)}
                                whileHover={{ scale: 1.12 }}
                                whileTap={{ scale: 0.88 }}
                                style={{
                                  width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
                                  background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                                  color: '#e05555', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Trash2 size={13} />
                              </motion.button>
                            </div>

                            <p style={{ color: gold, fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>
                              {fmt(item.price)} each
                            </p>

                            {/* Add-ons */}
                            {item.addOns && item.addOns.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                {item.addOns.map((a, idx) => (
                                  <span key={idx} style={{
                                    background: 'rgba(200,151,42,0.1)',
                                    border: '1px solid rgba(200,151,42,0.2)',
                                    color: '#a89070', borderRadius: '4px',
                                    padding: '2px 7px', fontSize: '11px',
                                  }}>
                                    +{a.name} ({fmt(a.price)})
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Qty + total row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              {/* Qty controls */}
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '2px',
                                background: '#242424', border: '1px solid rgba(200,151,42,0.18)',
                                borderRadius: '8px', padding: '3px',
                              }}>
                                <motion.button
                                  onClick={() => restaurantSlug && updateQuantity(item.id, item.quantity - 1, restaurantSlug)}
                                  whileTap={{ scale: 0.85 }}
                                  style={{
                                    width: '26px', height: '26px', borderRadius: '6px', border: 'none',
                                    background: item.quantity === 1 ? 'rgba(220,38,38,0.15)' : 'transparent',
                                    color: item.quantity === 1 ? '#e05555' : '#f8f4ed',
                                    cursor: 'pointer', fontSize: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={13} />}
                                </motion.button>
                                <span style={{
                                  width: '28px', textAlign: 'center',
                                  color: '#f8f4ed', fontWeight: 700, fontSize: '14px',
                                }}>
                                  {item.quantity}
                                </span>
                                <motion.button
                                  onClick={() => restaurantSlug && updateQuantity(item.id, item.quantity + 1, restaurantSlug)}
                                  whileTap={{ scale: 0.85 }}
                                  style={{
                                    width: '26px', height: '26px', borderRadius: '6px', border: 'none',
                                    background: gold, color: '#080808',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  <Plus size={13} />
                                </motion.button>
                              </div>

                              {/* Item total */}
                              <span style={{ color: goldLight, fontWeight: 800, fontSize: '15px' }}>
                                {fmt(itemTotal)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {cartItems.length > 0 && (
              <div style={{
                borderTop: '1px solid rgba(200,151,42,0.15)',
                padding: '16px 20px 20px',
                background: '#0a0a0a',
                flexShrink: 0,
              }}>
                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ color: '#a89070', fontSize: '14px' }}>Subtotal ({totalCount} items)</span>
                  <span style={{ color: goldLight, fontSize: '22px', fontWeight: 900 }}>{fmt(totalPrice)}</span>
                </div>

                {/* Checkout button */}
                <Link
                  href={restaurantSlug ? `/checkout?restaurant=${encodeURIComponent(restaurantSlug)}` : '/cart'}
                  onClick={onClose}
                >
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(240,192,96,0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                      color: '#080808', fontWeight: 800, fontSize: '15px',
                      padding: '14px', borderRadius: '12px', border: 'none',
                      cursor: 'pointer', letterSpacing: '0.03em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 20px rgba(200,151,42,0.3)',
                    }}
                  >
                    Proceed to Checkout <ArrowRight size={17} />
                  </motion.button>
                </Link>

                {/* View Full Cart */}
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <Link
                    href={restaurantSlug ? `/cart?restaurant=${encodeURIComponent(restaurantSlug)}` : '/cart'}
                    onClick={onClose}
                    style={{ color: '#a89070', fontSize: '13px', textDecoration: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = goldLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#a89070')}
                  >
                    View Full Cart →
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { orderService } from '@/services/order.service';
import { loadRazorpayScript } from '@/utils/razorpay';
import api from '@/services/api';
import {
  User, Phone, Mail, Hash, FileText, CreditCard, Banknote,
  CheckCircle, Truck, ArrowLeft, MapPin, UtensilsCrossed,
  ShoppingBag, ArrowRight, Package, AlertCircle,
} from 'lucide-react';

const gold = '#c8972a';
const goldLight = '#f0c060';

const inp: React.CSSProperties = {
  width: '100%', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)',
  borderRadius: '12px', padding: '13px 16px', color: '#f8f4ed', fontSize: '15px',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const lbl: React.CSSProperties = {
  display: 'block', color: '#a89070', fontSize: '12px', fontWeight: 600,
  marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase',
};
const card: React.CSSProperties = {
  background: '#141414', border: '1px solid rgba(200,151,42,0.15)',
  borderRadius: '18px', overflow: 'hidden', marginBottom: '20px',
};
const cardHead: React.CSSProperties = {
  padding: '16px 22px', borderBottom: '1px solid rgba(200,151,42,0.1)',
  display: 'flex', alignItems: 'center', gap: '10px',
};
const iconBox: React.CSSProperties = {
  width: '34px', height: '34px', borderRadius: '10px',
  background: 'rgba(200,151,42,0.12)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

type OrderType = 'delivery' | 'dinein' | 'takeaway';

const ORDER_TYPES: { key: OrderType; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'delivery', label: 'Delivery', icon: Truck, desc: 'Delivered to your door' },
  { key: 'dinein',   label: 'Dine In',  icon: UtensilsCrossed, desc: 'Eat at the restaurant' },
  { key: 'takeaway', label: 'Takeaway', icon: Package, desc: 'Pick up your order' },
];

function CheckoutPageContent() {
  const { getCartItems, getTotalPrice, clearCart, activeCartSlug } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get('restaurant') ?? activeCartSlug ?? undefined;

  const cartItems = getCartItems(restaurantSlug);
  const itemsSubtotal = getTotalPrice(restaurantSlug);

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', tableNumber: '',
    deliveryAddress: '', notes: '',
  });
  const [razorpayKey, setRazorpayKey] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const deliveryCharge = orderType === 'delivery' ? 50 : 0;

  const gstAmount = Math.round(itemsSubtotal * (taxRate / 100));
  const finalTotal = itemsSubtotal + gstAmount + deliveryCharge;
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    setMounted(true);
    setRazorpayKey(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '');
    try {
      const u = localStorage.getItem('restro-user');
      if (u) {
        const parsed = JSON.parse(u);
        setForm(f => ({
          ...f,
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
        }));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!restaurantSlug) { setTaxRate(0); return; }
    api.get<{ taxRate?: number }>(`/restaurants/by-slug/${restaurantSlug}`)
      .then(d => setTaxRate(typeof d.taxRate === 'number' ? d.taxRate : 0))
      .catch(() => setTaxRate(0));
  }, [restaurantSlug]);

  useEffect(() => {
    if (!mounted) return;
    if (cartItems.length === 0) {
      router.replace(restaurantSlug ? `/menu?restaurant=${encodeURIComponent(restaurantSlug)}` : '/');
    }
  }, [mounted, cartItems.length, restaurantSlug, router]);

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = gold);
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = 'rgba(200,151,42,0.2)');

  const isDemoCart = !restaurantSlug || restaurantSlug === 'home';

  const validate = () => {
    if (isDemoCart) {
      alert('Ye demo items hain. Kisi restaurant ka menu open karke order karein.');
      return false;
    }
    if (!form.name.trim()) { alert('Name is required'); return false; }
    if (!form.phone.trim()) { alert('Phone is required'); return false; }
    if (orderType === 'delivery' && !form.deliveryAddress.trim()) {
      alert('Delivery address is required'); return false;
    }
    return true;
  };

  const orderPayload = () => ({
    items: cartItems.map(i => ({
      menuItemId: i.id, quantity: i.quantity, price: i.price,
      addOns: i.addOns || [], customizations: i.customizations || '',
    })),
    total: finalTotal,
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone,
    tableNumber: orderType === 'dinein' ? form.tableNumber : '',
    notes: form.notes,
    orderType,
    deliveryAddress: orderType === 'delivery' ? form.deliveryAddress : '',
  });

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    paymentMethod === 'cod' ? await placeCOD() : await placeOnline();
  };

  const afterSuccess = () => {
    setPaymentSuccess(true);
    if (restaurantSlug) clearCart(restaurantSlug);
    const real = restaurantSlug && restaurantSlug !== 'home';
    setTimeout(() => router.push(real ? `/menu?restaurant=${encodeURIComponent(restaurantSlug!)}` : '/'), 3500);
  };

  const placeCOD = async () => {
    try {
      setProcessing(true);
      await orderService.createOrder({ ...orderPayload(), paymentMethod: 'cash' });
      afterSuccess();
    } catch (err: any) {
      alert(err?.message || err?.response?.data?.error || 'Failed to place order');
    } finally { setProcessing(false); }
  };

  const placeOnline = async () => {
    if (!razorpayKey) {
      alert('Online payment is not configured. Please use Cash on Delivery.');
      setPaymentMethod('cod');
      return;
    }
    try {
      setProcessing(true);
      const order = await orderService.createOrder({ ...orderPayload(), paymentMethod: 'online' });
      await loadRazorpayScript();
      const rzp = await api.post('/payments/create-order', {
        orderId: order.id || (order as any)._id, amount: finalTotal,
      }) as { amount: number; currency: string; orderId: string };
      new window.Razorpay({
        key: razorpayKey, amount: rzp.amount, currency: rzp.currency,
        name: 'Restro OS', description: `Order #${order.orderNumber}`, order_id: rzp.orderId,
        handler: async (res: any) => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: rzp.orderId, paymentId: res.razorpay_payment_id,
              signature: res.razorpay_signature, dbOrderId: order.id || (order as any)._id,
            });
            afterSuccess();
          } catch (e: any) {
            alert(e?.response?.data?.error || e?.message || 'Payment verification failed');
          } finally { setProcessing(false); }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: gold },
        modal: { ondismiss: () => setProcessing(false) },
      }).open();
    } catch (err: any) {
      alert(err?.message || err?.response?.data?.error || 'Payment failed');
      setProcessing(false);
    }
  };

  /* ── Success ── */
  if (paymentSuccess) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: '420px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(76,175,80,0.1)', border: '2px solid rgba(76,175,80,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <CheckCircle size={52} color="#81c784" />
        </motion.div>
        <h2 style={{ color: '#f8f4ed', fontSize: '30px', fontWeight: 900, margin: '0 0 10px' }}>Order Placed!</h2>
        <p style={{ color: '#a89070', fontSize: '16px', lineHeight: 1.6, margin: '0 0 6px' }}>
          {orderType === 'delivery' ? "We'll deliver your order soon." : orderType === 'dinein' ? "Your table will be served shortly." : "Your order will be ready for pickup."}
        </p>
        <p style={{ color: '#6b5040', fontSize: '13px' }}>Redirecting...</p>
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#a89070', fontSize: '13px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(200,151,42,0.3)', borderTopColor: gold, animation: 'spin 0.8s linear infinite' }} />
          Please wait...
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </motion.div>
    </div>
  );

  /* ── Loading ── */
  if (!mounted || cartItems.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(200,151,42,0.2)', borderTopColor: gold, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: '28px 0 60px' }}>
      <div style={{ maxWidth: '940px', margin: '0 auto', padding: '0 20px' }}>

        {/* Back */}
        <button onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#a89070', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = goldLight)}
          onMouseLeave={e => (e.currentTarget.style.color = '#a89070')}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
          <h1 style={{ color: '#f8f4ed', fontSize: '26px', fontWeight: 900, margin: '0 0 4px' }}>Checkout</h1>
          <p style={{ color: '#a89070', fontSize: '14px', margin: 0 }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · {fmt(itemsSubtotal)} subtotal</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }} className="co-grid">

          {/* ── LEFT ── */}
          <div>

            {/* Order Type */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={card}>
              <div style={cardHead}>
                <div style={iconBox}><Truck size={16} color={gold} /></div>
                <div>
                  <h2 style={{ color: '#f8f4ed', fontSize: '15px', fontWeight: 700, margin: 0 }}>Order Type</h2>
                </div>
              </div>
              <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                {ORDER_TYPES.map(({ key, label, icon: Icon, desc }) => (
                  <button key={key} onClick={() => setOrderType(key)}
                    style={{
                      padding: '14px 10px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                      border: orderType === key ? `1.5px solid ${gold}` : '1.5px solid rgba(200,151,42,0.12)',
                      background: orderType === key ? 'rgba(200,151,42,0.1)' : '#1a1a1a',
                      transition: 'all 0.2s',
                    }}>
                    <Icon size={20} color={orderType === key ? gold : '#6b5040'} style={{ margin: '0 auto 6px' }} />
                    <p style={{ color: orderType === key ? '#f8f4ed' : '#a89070', fontSize: '13px', fontWeight: 700, margin: '0 0 2px' }}>{label}</p>
                    <p style={{ color: '#6b5040', fontSize: '11px', margin: 0 }}>{desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Customer Info */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={card}>
              <div style={cardHead}>
                <div style={iconBox}><User size={16} color={gold} /></div>
                <div>
                  <h2 style={{ color: '#f8f4ed', fontSize: '15px', fontWeight: 700, margin: 0 }}>Customer Details</h2>
                  <p style={{ color: '#a89070', fontSize: '12px', margin: 0 }}>* required fields</p>
                </div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="co-2col">
                  <div>
                    <label style={lbl}><User size={10} style={{ display: 'inline', marginRight: 4 }} />Name *</label>
                    <input type="text" placeholder="Full name" value={form.name} onChange={setField('name')}
                      style={inp} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={lbl}><Phone size={10} style={{ display: 'inline', marginRight: 4 }} />Phone *</label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={setField('phone')}
                      style={inp} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="co-2col">
                  <div>
                    <label style={lbl}><Mail size={10} style={{ display: 'inline', marginRight: 4 }} />Email</label>
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={setField('email')}
                      style={inp} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  {orderType === 'dinein' && (
                    <div>
                      <label style={lbl}><Hash size={10} style={{ display: 'inline', marginRight: 4 }} />Table No.</label>
                      <input type="text" placeholder="e.g. T05" value={form.tableNumber} onChange={setField('tableNumber')}
                        style={inp} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  )}
                </div>

                {/* Delivery address — shown only for delivery */}
                <AnimatePresence>
                  {orderType === 'delivery' && (
                    <motion.div key="addr" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label style={lbl}><MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />Delivery Address *</label>
                      <textarea placeholder="House/Flat no., Street, Area, City, PIN" value={form.deliveryAddress}
                        onChange={setField('deliveryAddress')} rows={3}
                        style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                        onFocus={focusIn} onBlur={focusOut} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label style={lbl}><FileText size={10} style={{ display: 'inline', marginRight: 4 }} />Special Instructions</label>
                  <textarea placeholder="Allergies, preferences, extra spicy... (optional)" value={form.notes}
                    onChange={setField('notes')} rows={2}
                    style={{ ...inp, resize: 'vertical', minHeight: '64px' }}
                    onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={card}>
              <div style={cardHead}>
                <div style={iconBox}><CreditCard size={16} color={gold} /></div>
                <h2 style={{ color: '#f8f4ed', fontSize: '15px', fontWeight: 700, margin: 0 }}>Payment Method</h2>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {([
                  { key: 'online' as const, label: 'Online Payment', desc: 'UPI · Cards · Wallets via Razorpay', Icon: CreditCard },
                  { key: 'cod' as const, label: 'Cash on Delivery', desc: 'Pay when order arrives', Icon: Banknote },
                ]).map(({ key, label, desc, Icon }) => {
                  const isOnlineDisabled = key === 'online' && !razorpayKey;
                  return (
                  <label key={key} onClick={() => !isOnlineDisabled && setPaymentMethod(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                      borderRadius: '12px', cursor: isOnlineDisabled ? 'not-allowed' : 'pointer',
                      opacity: isOnlineDisabled ? 0.4 : 1,
                      border: paymentMethod === key ? `1.5px solid rgba(200,151,42,0.5)` : '1.5px solid rgba(200,151,42,0.1)',
                      background: paymentMethod === key ? 'rgba(200,151,42,0.07)' : 'transparent',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      border: paymentMethod === key ? `5px solid ${gold}` : '2px solid rgba(200,151,42,0.3)',
                      transition: 'all 0.2s',
                    }} />
                    <Icon size={18} color={paymentMethod === key ? gold : '#6b5040'} />
                    <div>
                      <p style={{ color: paymentMethod === key ? '#f8f4ed' : '#a89070', fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>{label}{isOnlineDisabled ? ' (Not configured)' : ''}</p>
                      <p style={{ color: '#6b5040', fontSize: '12px', margin: 0 }}>{desc}</p>
                    </div>
                  </label>
                  );
                })}
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT: Order Summary ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.18)', borderRadius: '18px', overflow: 'hidden', position: 'sticky', top: '90px' }}>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(200,151,42,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={iconBox}><ShoppingBag size={15} color={gold} /></div>
              <h2 style={{ color: '#f8f4ed', fontSize: '16px', fontWeight: 800, margin: 0 }}>Order Summary</h2>
            </div>

            {/* Items */}
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {cartItems.map((item, i) => {
                const itotal = (item.price + (item.addOns ?? []).reduce((s, a) => s + a.price, 0)) * item.quantity;
                return (
                  <div key={`${item.id}-${i}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#242424', border: '1px solid rgba(200,151,42,0.1)' }}>
                      {item.image
                        ? <Image src={item.image} alt={item.name} width={44} height={44} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={16} color="rgba(200,151,42,0.3)" /></div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#f8f4ed', fontSize: '13px', fontWeight: 600, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ color: '#a89070', fontSize: '12px', margin: 0 }}>×{item.quantity} · {fmt(item.price)}</p>
                    </div>
                    <span style={{ color: goldLight, fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>{fmt(itotal)}</span>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(200,151,42,0.1)', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {[
                { label: 'Subtotal', value: fmt(itemsSubtotal) },
                { label: `GST (${taxRate}%)`, value: fmt(gstAmount) },
                { label: `Delivery ${orderType !== 'delivery' ? '(N/A)' : ''}`, value: orderType === 'delivery' ? fmt(deliveryCharge) : '—', icon: <Truck size={11} /> },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a89070', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>{row.icon}{row.label}</span>
                  <span style={{ color: '#f8f4ed', fontSize: '13px' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(200,151,42,0.15)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#f8f4ed', fontSize: '16px', fontWeight: 700 }}>Total</span>
                <span style={{ color: goldLight, fontSize: '26px', fontWeight: 900 }}>{fmt(finalTotal)}</span>
              </div>
            </div>

            {/* Demo cart warning */}
            {isDemoCart && (
              <div style={{ margin: '0 20px 12px', background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={15} color="#f0a030" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: '#f0a030', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                  Ye <strong>demo items</strong> hain — real order nahi hoga. Kisi restaurant ka menu open karke order karein.
                </p>
              </div>
            )}

            {/* Place order button */}
            <div style={{ padding: '0 20px 20px' }}>
              <motion.button
                onClick={handlePlaceOrder}
                disabled={processing || isDemoCart}
                whileHover={!processing ? { scale: 1.02, boxShadow: '0 8px 32px rgba(240,192,96,0.35)' } : {}}
                whileTap={!processing ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '15px',
                  background: processing ? '#3a2a10' : `linear-gradient(135deg, #8b5a00, ${gold}, ${goldLight})`,
                  color: '#080808', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 800, cursor: processing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 20px rgba(200,151,42,0.3)',
                  transition: 'background 0.3s',
                }}>
                {processing ? (
                  <>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(8,8,8,0.3)', borderTopColor: '#080808', animation: 'spin 0.8s linear infinite' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'cod' ? <Truck size={17} /> : <CreditCard size={17} />}
                    {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 800px) {
          .co-grid { grid-template-columns: 1fr !important; }
          .co-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { menuService, MenuItem as ApiMenuItem } from '@/services/menu.service';
import toast, { Toaster } from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import { Plus, Check, Star } from 'lucide-react';

type FilterType = 'all' | 'veg' | 'nonveg';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  isVeg: boolean;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  tag: string;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Veg Supreme Burger',
    price: 149,
    originalPrice: 199,
    isVeg: true,
    rating: 4.5,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=85&fit=crop',
    badge: 'BESTSELLER',
    tag: 'burger',
  },
  {
    id: 2,
    name: 'Margherita Pizza',
    price: 249,
    originalPrice: 349,
    isVeg: true,
    rating: 4.7,
    reviews: 456,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=85&fit=crop',
    badge: null,
    tag: 'pizza',
  },
  {
    id: 3,
    name: 'Veg Biryani',
    price: 199,
    originalPrice: 249,
    isVeg: true,
    rating: 4.3,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=85&fit=crop',
    badge: 'SPICY 🌶',
    tag: 'biryani',
  },
  {
    id: 4,
    name: 'Paneer Tikka Pizza',
    price: 299,
    originalPrice: 399,
    isVeg: true,
    rating: 4.6,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=85&fit=crop',
    badge: "CHEF'S PICK",
    tag: 'pizza',
  },
  {
    id: 5,
    name: 'Mushroom Pasta',
    price: 179,
    originalPrice: 229,
    isVeg: true,
    rating: 4.4,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=85&fit=crop',
    badge: null,
    tag: 'pasta',
  },
  {
    id: 6,
    name: 'Veg Spring Rolls (6 pcs)',
    price: 119,
    originalPrice: 159,
    isVeg: true,
    rating: 4.2,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1606525437099-fcacef80d04e?w=400&q=85&fit=crop',
    badge: 'STARTER',
    tag: 'snacks',
  },
  {
    id: 7,
    name: 'Crispy Chicken Burger',
    price: 189,
    originalPrice: 249,
    isVeg: false,
    rating: 4.8,
    reviews: 678,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=85&fit=crop',
    badge: 'MOST LOVED',
    tag: 'burger',
  },
  {
    id: 8,
    name: 'Butter Chicken Pizza',
    price: 349,
    originalPrice: 449,
    isVeg: false,
    rating: 4.9,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=85&fit=crop',
    badge: 'BESTSELLER',
    tag: 'pizza',
  },
  {
    id: 9,
    name: 'Chicken Biryani',
    price: 249,
    originalPrice: 299,
    isVeg: false,
    rating: 4.7,
    reviews: 567,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=85&fit=crop',
    badge: 'SPICY 🌶',
    tag: 'biryani',
  },
  {
    id: 10,
    name: 'BBQ Chicken Wings (8 pcs)',
    price: 269,
    originalPrice: 349,
    isVeg: false,
    rating: 4.6,
    reviews: 423,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=85&fit=crop',
    badge: null,
    tag: 'chicken',
  },
  {
    id: 11,
    name: 'Chicken Zinger Combo',
    price: 229,
    originalPrice: 299,
    isVeg: false,
    rating: 4.5,
    reviews: 334,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=85&fit=crop',
    badge: 'HOT DEAL',
    tag: 'burger',
  },
  {
    id: 12,
    name: 'Prawn Fried Rice',
    price: 319,
    originalPrice: 399,
    isVeg: false,
    rating: 4.4,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=85&fit=crop',
    badge: null,
    tag: 'rice',
  },
];

const filterButtons: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all',    label: 'ALL',     icon: '' },
  { key: 'veg',    label: 'VEG',     icon: '🟢' },
  { key: 'nonveg', label: 'NON-VEG', icon: '🔴' },
];

/** Standard Indian food-type indicator: coloured square frame + coloured dot inside */
function VegIndicator({ isVeg }: { isVeg: boolean }) {
  const colour = isVeg ? '#4caf50' : '#c41230';
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        border: `2px solid ${colour}`,
        background: '#fff',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          background: colour,
        }}
      />
    </div>
  );
}

/** Badge colour logic */
function badgeBg(badge: string): string {
  if (badge.includes('SPICY'))    return '#c8972a';
  if (badge.includes('BESTSELLER') || badge.includes("CHEF'S PICK")) return '#f0c060';
  if (badge.includes('MOST LOVED') || badge.includes('HOT DEAL'))    return '#d4860a';
  if (badge.includes('STARTER'))  return '#8b6010';
  return '#c8972a';
}

function badgeColor(badge: string): string {
  if (badge.includes('BESTSELLER') || badge.includes("CHEF'S PICK")) return '#080808';
  return '#ffffff';
}

// Static demo items used only when no real restaurant is configured
const DEMO_ITEMS: MenuItem[] = menuItems;

export default function MenuSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [cart, setCart] = useState<string[]>([]);
  const [realItems, setRealItems] = useState<ApiMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart: addToCartCtx, openCartDrawer } = useCart();
  const { restaurant } = useRestaurantPage();
  const searchParams = useSearchParams();
  const restaurantSlug = restaurant?.slug || searchParams.get('restaurant') || '';
  const isReal = !!restaurantSlug && restaurantSlug !== 'home';

  // Fetch real items when slug is available
  useEffect(() => {
    if (!isReal) { setRealItems([]); return; }
    setLoading(true);
    menuService.getMenuItems({ restaurant: restaurantSlug, available: true, limit: 8, sortBy: 'createdAt', sortOrder: 'desc' })
      .then(res => setRealItems(res.items))
      .catch(() => setRealItems([]))
      .finally(() => setLoading(false));
  }, [restaurantSlug, isReal]);

  // Merge real + demo for display
  const allItems: MenuItem[] = useMemo(() => {
    if (isReal && realItems.length > 0) {
      return realItems.map(i => ({
        id: i._id || i.id || '',
        name: i.name,
        price: i.price,
        originalPrice: Math.round(i.price * 1.2),
        isVeg: i.isVeg,
        rating: 4.5,
        reviews: 0,
        image: i.image || '',
        badge: null,
        tag: i.category,
      })) as unknown as MenuItem[];
    }
    return DEMO_ITEMS;
  }, [isReal, realItems]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'veg')    return allItems.filter((item) => item.isVeg);
    if (activeFilter === 'nonveg') return allItems.filter((item) => !item.isVeg);
    return allItems;
  }, [activeFilter, allItems]);

  const addToCart = (id: string | number) => {
    const sid = String(id);
    const item = allItems.find((m) => String(m.id) === sid);
    if (item) {
      const slug = isReal ? restaurantSlug : 'home';
      addToCartCtx({ id: sid, name: item.name, price: item.price, image: item.image }, slug);
      toast.success(`${item.name} added to cart!`, {
        duration: 1500,
        style: { background: '#141414', color: '#f8f4ed', border: '1px solid rgba(200,151,42,0.3)' },
      });
      openCartDrawer();
    }
    setCart((prev) => [...prev, sid]);
    setTimeout(() => setCart((prev) => prev.filter((x) => x !== sid)), 1800);
  };

  return (
    <section
      id="our-menu"
      style={{ background: 'var(--rb-bg)', padding: '90px 0' }}
    >
      <Toaster position="top-right" />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── Section Header ── */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: '52px' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p style={{
            color: '#c8972a',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            — Explore Our Selection —
          </p>
          <h2 style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 900,
            color: 'var(--rb-text)',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            margin: '0 0 14px',
            lineHeight: 1.05,
          }}>
            OUR{' '}
            <span style={{
              background: 'linear-gradient(135deg, #e8d5a0 0%, #f0c060 60%, #c8972a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              MENU
            </span>
          </h2>
          <p style={{ color: 'var(--rb-text2)', fontSize: '16px', margin: 0, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            Fresh ingredients, bold flavors, every single time.
          </p>
          {isReal && (
            <p style={{ marginTop: '10px', fontSize: '13px', color: 'rgba(200,151,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
              {loading ? 'Loading menu...' : `${allItems.length} items from restaurant`}
            </p>
          )}
        </motion.div>

        {/* ── Veg / Non-Veg Filter ── */}
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '52px', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {filterButtons.map((btn) => {
            const isActive = activeFilter === btn.key;
            return (
              <motion.button
                key={btn.key}
                onClick={() => setActiveFilter(btn.key)}
                whileHover={isActive ? { scale: 1.05 } : { scale: 1.05, borderColor: 'rgba(200,151,42,0.4)', color: '#f0c060' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: btn.icon ? '8px' : '0',
                  padding: '11px 28px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  border: `2px solid ${isActive ? '#c8972a' : 'rgba(255,255,255,0.18)'}`,
                  background: isActive ? '#c8972a' : 'transparent',
                  color: isActive ? '#080808' : 'var(--rb-text2)',
                  transition: 'all 0.22s ease',
                  outline: 'none',
                }}
              >
                {btn.icon && <span style={{ fontSize: '16px', lineHeight: 1 }}>{btn.icon}</span>}
                {btn.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Menu Grid ── */}
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '22px',
          }}
          className="menu-grid"
        >
          {/* Loading skeletons */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--rb-surface)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(200,151,42,0.1)', animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ height: '220px', background: 'rgba(200,151,42,0.06)' }} />
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ height: '16px', background: 'rgba(200,151,42,0.08)', borderRadius: '8px', width: '70%' }} />
                <div style={{ height: '12px', background: 'rgba(200,151,42,0.05)', borderRadius: '6px', width: '90%' }} />
                <div style={{ height: '20px', background: 'rgba(200,151,42,0.1)', borderRadius: '8px', width: '40%', marginTop: '6px' }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

          <AnimatePresence mode="popLayout">
            {!loading && filteredItems.map((item, index) => {
              const inCart = cart.includes(String(item.id));
              const discount = Math.round((1 - item.price / item.originalPrice) * 100);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.38, delay: index * 0.05, ease: 'easeOut' }}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(200,151,42,0.2)', borderColor: 'rgba(200,151,42,0.4)' }}
                  style={{
                    background: 'var(--rb-surface)',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid var(--rb-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
                  {/* ── Card Image ── */}
                  <div style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 */ }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Gradient overlay bottom */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
                      pointerEvents: 'none',
                    }} />

                    {/* Veg/Non-Veg indicator — top-left */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.65)',
                      borderRadius: '6px',
                      padding: '4px 5px',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <VegIndicator isVeg={item.isVeg} />
                    </div>

                    {/* Badge — top-right */}
                    {item.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: badgeBg(item.badge),
                        color: badgeColor(item.badge),
                        borderRadius: '100px',
                        padding: '4px 11px',
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.badge}
                      </div>
                    )}

                    {/* Discount pill — bottom-left over gradient */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                    }}>
                      <span style={{
                        background: '#4caf50',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: '4px',
                        padding: '3px 7px',
                        letterSpacing: '0.04em',
                      }}>
                        {discount}% OFF
                      </span>
                    </div>
                  </div>

                  {/* ── Card Body ── */}
                  <div style={{ padding: '16px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Name */}
                    <h3 style={{
                      color: 'var(--rb-text)',
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px',
                      lineHeight: 1.3,
                    }}>
                      {item.name}
                    </h3>

                    {/* Rating row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginBottom: '12px',
                    }}>
                      <Star size={13} fill="#f0c060" color="#f0c060" />
                      <span style={{ color: '#f0c060', fontSize: '13px', fontWeight: 700 }}>
                        {item.rating.toFixed(1)}
                      </span>
                      <span style={{ color: 'var(--rb-text3)', fontSize: '12px' }}>
                        ({item.reviews.toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Price + Add button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{
                          color: '#c8972a',
                          fontSize: '22px',
                          fontWeight: 900,
                          letterSpacing: '-0.01em',
                        }}>
                          ₹{item.price}
                        </span>
                        <span style={{
                          color: 'var(--rb-text3)',
                          fontSize: '13px',
                          textDecoration: 'line-through',
                          fontWeight: 500,
                        }}>
                          ₹{item.originalPrice}
                        </span>
                      </div>

                      {/* ADD + button */}
                      <motion.button
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); addToCart(item.id); }}
                        whileHover={{ scale: 1.1, boxShadow: '0 4px 20px rgba(200,151,42,0.5)' }}
                        whileTap={{ scale: 0.88 }}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          border: 'none',
                          background: inCart ? '#4caf50' : '#c8972a',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: inCart
                            ? '0 4px 16px rgba(76,175,80,0.45)'
                            : '0 4px 16px rgba(200,151,42,0.45)',
                          transition: 'background 0.22s ease, box-shadow 0.22s ease',
                          outline: 'none',
                        }}
                        aria-label={inCart ? 'Added to cart' : `Add ${item.name} to cart`}
                      >
                        {inCart ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* ── View Full Menu CTA ── */}
        <motion.div
          style={{ textAlign: 'center', marginTop: '60px' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.a
            href="/menu"
            whileHover={{ scale: 1.04, boxShadow: '0 12px 36px rgba(200,151,42,0.5)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-block',
              padding: '16px 52px',
              background: 'linear-gradient(135deg, #8b5a00 0%, #c8972a 100%)',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(200,151,42,0.3)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            View Full Menu &rarr;
          </motion.a>
        </motion.div>

      </div>

      {/* Responsive grid styles injected via a style tag */}
    </section>
  );
}

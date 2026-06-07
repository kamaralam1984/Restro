'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

// ─── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg: '#080808',
  card: '#141414',
  cardHover: '#1a1a1a',
  input: '#1c1c1c',
  gold: '#c8972a',
  goldLight: '#f0c060',
  text: '#f8f4ed',
  muted: '#a89070',
  border: 'rgba(200,151,42,0.15)',
  borderHover: 'rgba(200,151,42,0.35)',
  divider: 'rgba(248,244,237,0.06)',
};

const goldGradient = `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`;
const CART_KEY = 'restro_os_cart';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  isAvailable?: boolean;
  isSignature?: boolean;
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantSlug: string;
  tableNumber: string;
}

interface RestaurantInfo {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  city?: string;
  logo?: string;
  primaryColor?: string;
}

// ─── Cart helpers ──────────────────────────────────────────────────────────────
// Cart is stored as { [restaurantSlug]: CartItem[] }
function getCartForSlug(slug: string): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    const items = all[slug];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function saveCartForSlug(slug: string, cart: CartItem[]) {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[slug] = cart;
    localStorage.setItem(CART_KEY, JSON.stringify(all));
  } catch {}
}

// Keep old names as aliases for compatibility
function getCart(): CartItem[] { return []; }
function saveCart(_cart: CartItem[]) {}

function addToCart(item: MenuItem, slug: string, tableNumber: string): CartItem[] {
  const cart = getCartForSlug(slug);
  const existing = cart.find(c => c._id === item._id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      _id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      restaurantSlug: slug,
      tableNumber,
    });
  }
  saveCartForSlug(slug, cart);
  return cart;
}

function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.quantity, 0);
}

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
}

// ─── Price format ──────────────────────────────────────────────────────────────
function formatPrice(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ width, height, rounded }: { width: string | number; height: string | number; rounded?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: rounded ?? 8,
        background: 'linear-gradient(90deg, #181818 25%, #222 50%, #181818 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Menu Item Card ────────────────────────────────────────────────────────────
function MenuItemCard({
  item,
  slug,
  tableNumber,
  onAddToCart,
}: {
  item: MenuItem;
  slug: string;
  tableNumber: string;
  onAddToCart: (item: MenuItem) => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Image */}
      {item.image ? (
        <div style={{ position: 'relative', width: '100%', height: 150, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {item.isSignature && (
            <span
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: goldGradient,
                color: '#080808',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 4,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Signature
            </span>
          )}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: 100,
            background: 'rgba(200,151,42,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          &#127860;
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '14px 14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3
            style={{
              color: T.text,
              fontSize: 15,
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {item.name}
          </h3>
          {item.category && (
            <span
              style={{
                background: 'rgba(200,151,42,0.1)',
                color: T.muted,
                fontSize: 10,
                borderRadius: 4,
                padding: '2px 6px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {item.category}
            </span>
          )}
        </div>

        {item.description && (
          <p
            style={{
              color: T.muted,
              fontSize: 12,
              margin: 0,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span
              style={{
                background: goldGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span style={{ color: T.muted, fontSize: 12, textDecoration: 'line-through' }}>
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!item.isAvailable && item.isAvailable !== undefined}
            style={{
              background: added ? 'rgba(34,197,94,0.15)' : goldGradient,
              color: added ? '#22c55e' : '#080808',
              border: added ? '1px solid #22c55e' : 'none',
              borderRadius: 7,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: item.isAvailable === false ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: item.isAvailable === false ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {item.isAvailable === false ? 'Unavailable' : added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Floating Cart Bar ─────────────────────────────────────────────────────────
function CartBar({ cart, slug, tableNumber }: { cart: CartItem[]; slug: string; tableNumber: string }) {
  const count = cartCount(cart);
  const total = cartTotal(cart);

  if (count === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: 'calc(100% - 40px)',
        maxWidth: 480,
      }}
    >
      <Link
        href={`/cart?restaurant=${slug}&table=${tableNumber}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: goldGradient,
          borderRadius: 14,
          padding: '14px 20px',
          textDecoration: 'none',
          boxShadow: '0 8px 32px rgba(200,151,42,0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              background: 'rgba(8,8,8,0.25)',
              color: '#f8f4ed',
              borderRadius: 6,
              padding: '3px 9px',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {count}
          </span>
          <span style={{ color: '#080808', fontSize: 15, fontWeight: 700 }}>Go to Cart</span>
        </div>
        <span style={{ color: '#080808', fontSize: 15, fontWeight: 700 }}>{formatPrice(total)}</span>
      </Link>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function QRScanPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';
  const tableNumber = typeof params?.table === 'string' ? params.table : Array.isArray(params?.table) ? params.table[0] : '';

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount (after slug is available)
  useEffect(() => {
    if (slug) setCart(getCartForSlug(slug));
  }, [slug]);

  const loadData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      // Public endpoints — no auth required
      const [restData, menuData] = await Promise.all([
        api.get<any>(`/restaurants/by-slug/${slug}`).catch(() => null),
        api.get<any>('/menu', { params: { restaurant: slug, limit: 6 } }).catch(() => []),
      ]);

      // Normalise restaurant
      const rest: RestaurantInfo | null = restData
        ? {
            _id: restData._id || restData.data?._id || '',
            name: restData.name || restData.data?.name || slug,
            slug: restData.slug || slug,
            description: restData.description || restData.data?.description,
            city: restData.city || restData.data?.city,
            logo: restData.logo || restData.data?.logo,
            primaryColor: restData.primaryColor || restData.data?.primaryColor,
          }
        : null;
      setRestaurant(rest);

      // Normalise menu items
      const items: MenuItem[] = Array.isArray(menuData)
        ? menuData
        : Array.isArray(menuData?.items)
        ? menuData.items
        : Array.isArray(menuData?.data)
        ? menuData.data
        : [];
      setMenuItems(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      const updated = addToCart(item, slug, tableNumber);
      setCart([...updated]);
    },
    [slug, tableNumber]
  );

  // ── Render: loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: T.bg, minHeight: '100vh', padding: '0 0 100px' }}>
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } * { box-sizing: border-box; }`}</style>
        {/* Hero skeleton */}
        <div style={{ padding: '48px 20px 32px', textAlign: 'center' }}>
          <Skeleton width={64} height={64} rounded={50} />
          <div style={{ marginTop: 16 }}><Skeleton width={180} height={28} /></div>
          <div style={{ margin: '10px auto 0' }}><Skeleton width={120} height={18} /></div>
        </div>
        {/* Items skeleton */}
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={220} />
          ))}
        </div>
      </div>
    );
  }

  // ── Render: error ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          background: T.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          flexDirection: 'column',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#ef4444', fontSize: 15 }}>{error}</p>
        <button
          onClick={loadData}
          style={{
            background: goldGradient,
            color: '#080808',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const restaurantName = restaurant?.name || slug;
  const decodedTable = decodeURIComponent(tableNumber);

  // ── Render: main ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: '100vh', maxWidth: 540, margin: '0 auto', paddingBottom: 100 }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        a { text-decoration: none; }
      `}</style>

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '48px 20px 32px',
          textAlign: 'center',
          borderBottom: `1px solid ${T.divider}`,
          animation: 'fadeUp 0.5s ease both',
        }}
      >
        {/* Logo / Icon */}
        {restaurant?.logo ? (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${T.border}`,
              margin: '0 auto 16px',
              position: 'relative',
            }}
          >
            <Image src={restaurant.logo} alt={restaurantName} fill style={{ objectFit: 'cover' }} />
          </div>
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(200,151,42,0.1)',
              border: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 28,
            }}
          >
            &#127869;
          </div>
        )}

        {/* Restaurant name */}
        <h1
          style={{
            background: goldGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 26,
            fontWeight: 800,
            margin: '0 0 6px',
            letterSpacing: '-0.5px',
          }}
        >
          {restaurantName}
        </h1>

        {/* Table badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(200,151,42,0.1)',
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: '5px 14px',
            marginBottom: 16,
          }}
        >
          <span style={{ color: T.gold, fontSize: 13, fontWeight: 600 }}>
            Table {decodedTable}
          </span>
        </div>

        {/* City */}
        {restaurant?.city && (
          <p style={{ color: T.muted, fontSize: 13, margin: '0 0 4px' }}>{restaurant.city}</p>
        )}

        {/* Welcome message */}
        <p
          style={{
            color: T.muted,
            fontSize: 14,
            margin: '12px auto 0',
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          Welcome! Browse our menu and order directly from your table.
        </p>
      </div>

      {/* ── CTA Buttons ──────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '24px 20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          animation: 'fadeUp 0.5s ease 0.1s both',
        }}
      >
        <Link
          href={`/menu?restaurant=${slug}&table=${tableNumber}`}
          style={{
            display: 'block',
            background: goldGradient,
            color: '#080808',
            textAlign: 'center',
            borderRadius: 12,
            padding: '15px 20px',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.2px',
            boxShadow: '0 4px 20px rgba(200,151,42,0.25)',
          }}
        >
          View Full Menu &amp; Order
        </Link>

        <Link
          href={`/r/${slug}`}
          style={{
            display: 'block',
            background: 'transparent',
            color: T.gold,
            textAlign: 'center',
            borderRadius: 12,
            padding: '13px 20px',
            fontSize: 15,
            fontWeight: 600,
            border: `1px solid ${T.border}`,
          }}
        >
          Browse Menu
        </Link>
      </div>

      {/* ── Featured Items ────────────────────────────────────────────────────── */}
      {menuItems.length > 0 && (
        <div
          style={{
            padding: '28px 16px 0',
            animation: 'fadeUp 0.5s ease 0.2s both',
          }}
        >
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
              paddingLeft: 4,
            }}
          >
            <div
              style={{
                width: 3,
                height: 18,
                background: goldGradient,
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <h2
              style={{
                color: T.text,
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              Featured Items
            </h2>
          </div>

          {/* Items grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {menuItems.map(item => (
              <MenuItemCard
                key={item._id}
                item={item}
                slug={slug}
                tableNumber={decodedTable}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* View all link */}
          <Link
            href={`/menu?restaurant=${slug}&table=${tableNumber}`}
            style={{
              display: 'block',
              textAlign: 'center',
              color: T.gold,
              fontSize: 14,
              fontWeight: 600,
              marginTop: 20,
              padding: '12px',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
            }}
          >
            View All Menu Items
          </Link>
        </div>
      )}

      {/* ── Info strip ───────────────────────────────────────────────────────── */}
      <div
        style={{
          margin: '28px 16px 0',
          padding: '14px 16px',
          background: 'rgba(200,151,42,0.05)',
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>&#9432;</span>
        <p style={{ color: T.muted, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          Your order will be sent directly to the kitchen. A staff member will confirm and serve you at{' '}
          <strong style={{ color: T.gold }}>Table {decodedTable}</strong>.
        </p>
      </div>

      {/* ── Floating Cart Bar ─────────────────────────────────────────────────── */}
      <CartBar cart={cart} slug={slug} tableNumber={decodedTable} />
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ChefHat, Filter, Sparkles, ArrowUpDown, X, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import EnhancedMenuCard from '@/components/EnhancedMenuCard';
import { menuService, MenuItem, MenuCategory, MenuFilters } from '@/services/menu.service';
import { useLanguage } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import api from '@/services/api';
import ServiceSuspendedMessage from '@/components/ServiceSuspendedMessage';

// ── shared style tokens ──────────────────────────────────────────────────────
const gold = '#c8972a';
const goldLight = '#f0c060';

function activeBtn(active: boolean): React.CSSProperties {
  return active
    ? { background: `linear-gradient(135deg, #8b5a00, ${gold}, ${goldLight})`, color: '#080808', border: '1px solid transparent', fontWeight: 700 }
    : { background: '#1c1c1c', color: '#a89070', border: '1px solid rgba(200,151,42,0.18)', fontWeight: 500 };
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get('restaurant') || undefined;
  const initialCategory = searchParams.get('category') || 'all';
  const { t } = useLanguage();
  const { setRestaurant } = useRestaurantPage();
  const [restaurantSuspended, setRestaurantSuspended] = useState<boolean | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [restaurantLogo, setRestaurantLogo] = useState<string | undefined>(undefined);
  const [restaurantPrimaryColor, setRestaurantPrimaryColor] = useState<string>('#c8972a');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [filters, setFilters] = useState<MenuFilters>({
    category: initialCategory, isVeg: 'all', available: true, search: '',
    minPrice: undefined, maxPrice: undefined,
    sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 12,
    restaurant: restaurantSlug,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0,
    itemsPerPage: 12, hasNextPage: false, hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (!restaurantSlug) {
      setRestaurantSuspended(null); setRestaurantName(''); setRestaurantLogo(undefined); setRestaurant(null); return;
    }
    api.get<{ status?: string; subscriptionStatus?: string; name?: string; logo?: string; primaryColor?: string }>(`/restaurants/by-slug/${restaurantSlug}`)
      .then((r) => {
        const suspended = r.status === 'inactive' || r.subscriptionStatus === 'suspended' || r.subscriptionStatus === 'cancelled';
        setRestaurantSuspended(suspended);
        setRestaurantName(r.name || '');
        setRestaurantLogo(r.logo);
        setRestaurantPrimaryColor(r.primaryColor || gold);
        setRestaurant({ slug: restaurantSlug, name: r.name || restaurantSlug, logo: r.logo, primaryColor: r.primaryColor });
      })
      .catch(() => { setRestaurantSuspended(false); setRestaurant(null); });
  }, [restaurantSlug, setRestaurant]);

  useEffect(() => {
    document.title = restaurantName && restaurantSlug ? `${restaurantName} - Menu | Restro OS` : 'Our Menu | Restro OS';
    return () => { document.title = 'Restro OS'; };
  }, [restaurantName, restaurantSlug]);

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    if (restaurantSlug !== undefined)
      setFilters((p) => p.restaurant === restaurantSlug ? p : { ...p, restaurant: restaurantSlug, page: 1 });
  }, [restaurantSlug]);

  useEffect(() => {
    loadMenu();
  }, [filters.category, filters.isVeg, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortOrder, filters.page, filters.restaurant, debouncedSearch]);

  useEffect(() => { setFilters((p) => ({ ...p, search: debouncedSearch, page: 1 })); }, [debouncedSearch]);

  const loadInitialData = async () => {
    try {
      const [cats, priceRangeData] = await Promise.all([
        menuService.getCategories(restaurantSlug),
        menuService.getPriceRange(restaurantSlug),
      ]);
      setCategories(cats);
      setPriceRange(priceRangeData);
      setFilters((p) => ({ ...p, minPrice: priceRangeData.min, maxPrice: priceRangeData.max }));
    } catch (e) { console.error(e); }
  };

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenuItems(filters);
      setMenuItems(response.items);
      setPagination(response.pagination);
    } catch (e) { console.error(e); setMenuItems([]); }
    finally { setLoading(false); }
  };

  const handleCategoryChange = (category: string) => setFilters((p) => ({ ...p, category, page: 1 }));
  const handleVegFilterChange = (isVeg: 'all' | 'veg' | 'nonveg') => setFilters((p) => ({ ...p, isVeg, page: 1 }));
  const handleSortChange = (sortBy: 'name' | 'price' | 'createdAt' | 'category' | 'preparationTime') =>
    setFilters((p) => ({ ...p, sortBy, sortOrder: p.sortBy === sortBy && p.sortOrder === 'asc' ? 'desc' : 'asc' }));
  const handlePriceRangeChange = (min: number | undefined, max: number | undefined) =>
    setFilters((p) => ({ ...p, minPrice: min, maxPrice: max, page: 1 }));
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ category: 'all', isVeg: 'all', available: true, search: '', minPrice: priceRange.min, maxPrice: priceRange.max, sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 12, restaurant: restaurantSlug });
  };
  const handlePageChange = (page: number) => { setFilters((p) => ({ ...p, page })); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const hasActiveFilters = filters.category !== 'all' || filters.isVeg !== 'all' || !!filters.search || filters.minPrice !== priceRange.min || filters.maxPrice !== priceRange.max;

  const spinnerEl = (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: `3px solid rgba(200,151,42,0.2)`, borderTopColor: gold, animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#a89070', fontSize: '14px' }}>Loading menu…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (restaurantSlug && restaurantSuspended === true)
    return <div style={{ minHeight: '100vh', background: '#080808' }}><ServiceSuspendedMessage restaurantName={restaurantName} subscriptionExpired /></div>;

  if (loading && menuItems.length === 0) return spinnerEl;

  const primaryColor = restaurantPrimaryColor || gold;
  const inputStyle: React.CSSProperties = {
    background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)', borderRadius: '10px',
    padding: '9px 12px', color: '#f8f4ed', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f8f4ed' }}>

      {/* ── Hero ── */}
      <section style={{ padding: '60px 20px 50px', background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 700px 280px at 50% 0%, rgba(200,151,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>

          {/* Restaurant brand row */}
          {restaurantSlug && restaurantName && (
            <div style={{ marginBottom: '20px' }}>
              <Link href={`/r/${restaurantSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none', padding: '8px 18px', borderRadius: '100px', background: 'rgba(200,151,42,0.08)', border: '1px solid rgba(200,151,42,0.2)' }}>
                {restaurantLogo ? (
                  <Image src={restaurantLogo} alt={restaurantName} width={40} height={40} style={{ borderRadius: '10px', objectFit: 'cover' }} unoptimized />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${primaryColor}22`, border: `1px solid ${primaryColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={18} style={{ color: primaryColor }} />
                  </div>
                )}
                <span style={{ color: '#f8f4ed', fontSize: '15px', fontWeight: 600 }}>{restaurantName}</span>
              </Link>
            </div>
          )}

          <p style={{ color: gold, fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>EXPLORE OUR</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '14px' }}>
            <ChefHat size={44} color={gold} />
            <h1 style={{ fontSize: 'clamp(38px, 6vw, 62px)', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              Our <span style={{ background: `linear-gradient(135deg, ${gold}, ${goldLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Menu</span>
            </h1>
          </div>
          <p style={{ color: '#a89070', fontSize: '16px', marginBottom: '30px', lineHeight: 1.7 }}>
            Discover our delicious selection of dishes, crafted with love and the finest ingredients
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <Search size={18} color={gold} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Search dishes, ingredients…" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '46px', paddingTop: '14px', paddingBottom: '14px', borderRadius: '14px', fontSize: '15px' }}
              onFocus={e => e.target.style.borderColor = gold}
              onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'}
            />
          </div>
        </motion.div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ── Filters ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)', borderRadius: '18px', padding: '24px', marginBottom: '28px' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color={gold} />
              <h2 style={{ color: '#f8f4ed', fontSize: '17px', fontWeight: 700, margin: 0 }}>Filters</h2>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#a89070', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = goldLight)}
                onMouseLeave={e => (e.currentTarget.style.color = '#a89070')}
              >
                <X size={14} /> Clear All
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Category */}
            <div>
              <p style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Category</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button onClick={() => handleCategoryChange('all')}
                  style={{ padding: '7px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', ...activeBtn(filters.category === 'all') }}>
                  All
                </button>
                {(categories.length > 0 ? categories : ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Soup'].map(n => ({ name: n.toLowerCase(), count: 0 }))).map((cat) => {
                  const name = typeof cat === 'string' ? cat : cat.name;
                  const count = typeof cat === 'object' ? cat.count : 0;
                  const display = name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return (
                    <button key={name} onClick={() => handleCategoryChange(name)}
                      style={{ padding: '7px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', ...activeBtn(filters.category === name) }}>
                      {display}{count > 0 && <span style={{ opacity: 0.7, fontSize: '11px', marginLeft: '4px' }}>({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Veg / Non-veg */}
            <div>
              <p style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Type</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {([
                  { key: 'all', label: 'All', dot: null },
                  { key: 'veg', label: t('veg'), dot: '#22c55e' },
                  { key: 'nonveg', label: t('nonVeg'), dot: '#ef4444' },
                ] as { key: 'all' | 'veg' | 'nonveg'; label: string; dot: string | null }[]).map(({ key, label, dot }) => (
                  <button key={key} onClick={() => handleVegFilterChange(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', ...activeBtn(filters.isVeg === key) }}>
                    {dot && <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: dot, flexShrink: 0, display: 'inline-block' }} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Price Range: ₹{filters.minPrice ?? priceRange.min} – ₹{filters.maxPrice ?? priceRange.max}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '360px' }}>
                {[
                  { label: 'Min', val: filters.minPrice ?? priceRange.min, onChange: (v: number) => handlePriceRangeChange(v, filters.maxPrice) },
                  { label: 'Max', val: filters.maxPrice ?? priceRange.max, onChange: (v: number) => handlePriceRangeChange(filters.minPrice, v) },
                ].map(({ label, val, onChange }) => (
                  <div key={label}>
                    <p style={{ color: '#6b5040', fontSize: '11px', marginBottom: '5px' }}>{label} Price</p>
                    <input type="number" min={priceRange.min} max={priceRange.max} value={val}
                      onChange={e => onChange(Number(e.target.value))} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={12} /> Sort By
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {([
                  { value: 'name', label: 'Name' },
                  { value: 'price', label: 'Price' },
                  { value: 'createdAt', label: 'Newest' },
                  { value: 'category', label: 'Category' },
                ] as { value: 'name' | 'price' | 'createdAt' | 'category'; label: string }[]).map((s) => (
                  <button key={s.value} onClick={() => handleSortChange(s.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s', ...activeBtn(filters.sortBy === s.value) }}>
                    {s.label}
                    {filters.sortBy === s.value && <span style={{ fontSize: '12px' }}>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        {!loading && menuItems.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#6b5040', fontSize: '13px', marginBottom: '20px' }}>
            Showing <span style={{ color: goldLight, fontWeight: 700 }}>{pagination.totalItems}</span> item{pagination.totalItems !== 1 ? 's' : ''}
            {filters.search && <span> for "<span style={{ color: '#f8f4ed' }}>{filters.search}</span>"</span>}
          </motion.p>
        )}

        {/* Grid / Empty / Loading */}
        {loading && menuItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid rgba(200,151,42,0.2)`, borderTopColor: gold, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#a89070' }}>Loading menu items…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : menuItems.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(200,151,42,0.07)', border: '1px solid rgba(200,151,42,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ChefHat size={40} color="rgba(200,151,42,0.4)" />
            </div>
            <h3 style={{ color: '#f8f4ed', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>No items found</h3>
            <p style={{ color: '#a89070', fontSize: '14px', marginBottom: '24px' }}>
              {hasActiveFilters ? 'Try adjusting your filters or search term' : 'Menu items will appear here once added'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                style={{ padding: '12px 28px', background: `linear-gradient(135deg, #8b5a00, ${gold}, ${goldLight})`, color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 20px rgba(200,151,42,0.3)` }}>
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {menuItems.map((item, index) => (
                <EnhancedMenuCard key={item._id || item.id} item={item} index={index} restaurantSlug={restaurantSlug} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ marginTop: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevPage}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', background: '#1c1c1c', color: pagination.hasPrevPage ? '#f8f4ed' : '#4a3a2a', border: `1px solid ${pagination.hasPrevPage ? 'rgba(200,151,42,0.2)' : 'rgba(200,151,42,0.08)'}` }}>
                  <ChevronLeft size={15} /> Previous
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (pagination.totalPages > 5) {
                    if (pagination.currentPage <= 3) p = i + 1;
                    else if (pagination.currentPage >= pagination.totalPages - 2) p = pagination.totalPages - 4 + i;
                    else p = pagination.currentPage - 2 + i;
                  }
                  const isActive = pagination.currentPage === p;
                  return (
                    <button key={p} onClick={() => handlePageChange(p)}
                      style={{ width: '38px', height: '38px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s', ...activeBtn(isActive) }}>
                      {p}
                    </button>
                  );
                })}

                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', background: '#1c1c1c', color: pagination.hasNextPage ? '#f8f4ed' : '#4a3a2a', border: `1px solid ${pagination.hasNextPage ? 'rgba(200,151,42,0.2)' : 'rgba(200,151,42,0.08)'}` }}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Special Offers banner ── */}
        {!loading && menuItems.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ marginTop: '56px', borderRadius: '20px', padding: '44px 32px', textAlign: 'center', background: 'linear-gradient(135deg, #1a1000 0%, #2a1800 50%, #1a1000 100%)', border: `1px solid rgba(200,151,42,0.25)`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse 600px 200px at 50% 50%, rgba(200,151,42,0.08) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                <Sparkles size={22} color={goldLight} />
                <h2 style={{ color: '#f8f4ed', fontSize: '28px', fontWeight: 900, margin: 0 }}>Special Offers</h2>
                <Sparkles size={22} color={goldLight} />
              </div>
              <p style={{ color: '#a89070', fontSize: '15px', marginBottom: '22px', maxWidth: '520px', margin: '0 auto 22px', lineHeight: 1.7 }}>
                Order 3+ items and get 10% off! Use code <span style={{ color: goldLight, fontWeight: 700, background: 'rgba(240,192,96,0.1)', padding: '2px 8px', borderRadius: '6px' }}>SILVER10</span> at checkout.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                {['Free delivery on orders above ₹500', 'Hot & fresh food guaranteed', '30 minutes delivery'].map((item, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#a89070', fontSize: '13px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: gold, flexShrink: 0, display: 'inline-block' }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <MenuPageContent />
    </Suspense>
  );
}

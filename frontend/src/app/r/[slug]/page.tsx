'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, UtensilsCrossed, ArrowRight, Calendar, Phone, MapPin, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/services/api';
import ServiceSuspendedMessage from '@/components/ServiceSuspendedMessage';
import { getThemeById, DEFAULT_THEME_ID, type WebsiteTheme } from '@/config/websiteThemes';

interface HeroImage {
  _id?: string;
  imageUrl: string;
  order: number;
  isActive?: boolean;
}

interface RestaurantFeatures {
  menuManagement?: boolean;
  onlineOrdering?: boolean;
  tableBooking?: boolean;
  billing?: boolean;
  heroImages?: boolean;
  analytics?: boolean;
  [key: string]: boolean | undefined;
}

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  subscriptionStatus?: string;
  description?: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  primaryColor?: string;
  theme?: string;
  logo?: string;
  features?: RestaurantFeatures;
}

const DEFAULT_HERO = { imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80', order: 1 };

export default function RestaurantBySlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<Restaurant>(`/restaurants/by-slug/${slug}`)
      .then((data) => {
        setRestaurant(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    api
      .get<HeroImage[]>('/hero-images', { params: { restaurant: slug } })
      .then((data) => {
        const list = Array.isArray(data) ? data.filter((i) => i.imageUrl).sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
        setHeroImages(list.length > 0 ? list : [DEFAULT_HERO]);
      })
      .catch(() => setHeroImages([DEFAULT_HERO]));
  }, [slug]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  useEffect(() => {
    if (restaurant?.name) document.title = `${restaurant.name} | Restro OS`;
    return () => { document.title = 'Restro OS'; };
  }, [restaurant?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Restaurant not found</p>
          <Link href="/" className="mt-4 inline-block text-orange-400 hover:text-orange-300 text-sm font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const isSuspended =
    restaurant.status === 'inactive' ||
    restaurant.subscriptionStatus === 'suspended' ||
    restaurant.subscriptionStatus === 'cancelled';
  const subscriptionExpired = isSuspended;

  if (isSuspended) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <ServiceSuspendedMessage restaurantName={restaurant.name} subscriptionExpired={subscriptionExpired} />
      </div>
    );
  }

  const themeId = restaurant.theme && getThemeById(restaurant.theme) ? restaurant.theme! : DEFAULT_THEME_ID;
  const theme: WebsiteTheme = getThemeById(themeId) || getThemeById(DEFAULT_THEME_ID)!;
  const primary = restaurant.primaryColor || theme.primary;
  const features = restaurant.features ?? {};
  const showMenu = features.menuManagement !== false && features.onlineOrdering !== false;
  const showBooking = features.tableBooking === true;
  const menuUrl = `/menu?restaurant=${restaurant.slug}`;
  const bookingUrl = `/booking?restaurant=${restaurant.slug}`;
  const contactUrl = `/contact?restaurant=${restaurant.slug}`;
  const slides = heroImages.length ? heroImages : [DEFAULT_HERO];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/r/${restaurant.slug}`} className="flex items-center gap-3">
            {restaurant.logo ? (
              <Image src={restaurant.logo} alt={restaurant.name} width={44} height={44} className="rounded-xl object-cover shadow-lg" unoptimized />
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${primary}25`, border: `2px solid ${primary}50` }}>
                <Store className="w-6 h-6" style={{ color: primary }} />
              </div>
            )}
            <span className="text-lg font-bold text-white tracking-tight">{restaurant.name}</span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link href={`/r/${restaurant.slug}`} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Home
            </Link>
            {showMenu && (
              <Link href={menuUrl} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Menu
              </Link>
            )}
            {showBooking && (
              <Link href={bookingUrl} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Book Table
              </Link>
            )}
            <Link href={contactUrl} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero: Food slider with motion */}
      <section className="relative h-[70vh] min-h-[420px] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {slides.map((slide, i) =>
            i === slideIndex ? (
              <motion.div
                key={slide.imageUrl + i}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Overlay: logo, name, tagline, CTAs */}
        <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center mb-4"
            >
              {restaurant.logo ? (
                <Image src={restaurant.logo} alt="" width={80} height={80} className="rounded-2xl object-cover border-2 shadow-xl" style={{ borderColor: `${primary}60` }} unoptimized />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 shadow-xl" style={{ backgroundColor: `${primary}30`, borderColor: `${primary}60` }}>
                  <Store className="w-10 h-10" style={{ color: primary }} />
                </div>
              )}
            </motion.div>
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-2 text-white drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {restaurant.name}
            </motion.h1>
            {restaurant.description && (
              <motion.p
                className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {restaurant.description}
              </motion.p>
            )}
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              {showMenu && (
                <Link href={menuUrl}>
                  <button
                    className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg"
                    style={{ backgroundColor: primary }}
                  >
                    <UtensilsCrossed className="w-5 h-5" />
                    View Menu
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
              {showBooking && (
                <Link href={bookingUrl}>
                  <button
                    className="inline-flex items-center gap-2 border-2 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] bg-white/5"
                    style={{ borderColor: primary, color: primary }}
                  >
                    <Calendar className="w-5 h-5" />
                    Book a Table
                  </button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* Slider controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setSlideIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white z-10 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setSlideIndex((i) => (i + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white z-10 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlideIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === slideIndex ? 'scale-125 opacity-100' : 'opacity-50 hover:opacity-80'}`}
                  style={{ backgroundColor: i === slideIndex ? primary : 'white' }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Location if present */}
      {restaurant.city && (
        <section className="py-4 px-4 border-b border-slate-800">
          <p className="text-center text-slate-500 text-sm flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" style={{ color: primary }} />
            {restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''}
          </p>
        </section>
      )}

      {/* Rental Admin info */}
      <section className="border-t border-slate-800 py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-slate-500 text-sm mb-2">Restaurant owner?</p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Rental Admin Panel Login
          </Link>
          <p className="text-slate-600 text-xs mt-2">
            ID &amp; password is created from Super Admin panel. Contact your platform admin for credentials.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> {restaurant.phone}
              </a>
            )}
            {restaurant.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {restaurant.address}
                {restaurant.city && `, ${restaurant.city}`}
              </span>
            )}
          </div>
          <Link href="/" className="hover:text-white transition-colors">
            Powered by Restro OS
          </Link>
        </div>
      </footer>
    </div>
  );
}

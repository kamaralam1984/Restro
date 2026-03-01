'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Store, UtensilsCrossed, ArrowRight, Calendar, Phone, MapPin, LogIn } from 'lucide-react';
import api from '@/services/api';
import ServiceSuspendedMessage from '@/components/ServiceSuspendedMessage';

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
  logo?: string;
}

export default function RestaurantBySlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
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
    if (restaurant?.name) {
      document.title = `${restaurant.name} | Restro OS`;
    }
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

  const primary = restaurant.primaryColor || '#ea580c';
  const menuUrl = `/menu?restaurant=${restaurant.slug}`;
  const bookingUrl = `/booking?restaurant=${restaurant.slug}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/r/${restaurant.slug}`} className="flex items-center gap-3">
            {restaurant.logo ? (
              <Image src={restaurant.logo} alt={restaurant.name} width={40} height={40} className="rounded-xl object-cover" unoptimized />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primary}30` }}>
                <Store className="w-5 h-5" style={{ color: primary }} />
              </div>
            )}
            <span className="text-lg font-bold text-white">{restaurant.name}</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href={`/r/${restaurant.slug}`} className="text-slate-300 hover:text-white text-sm font-medium">
              Home
            </Link>
            <Link href={menuUrl} className="text-slate-300 hover:text-white text-sm font-medium">
              Menu
            </Link>
            <Link href={bookingUrl} className="text-slate-300 hover:text-white text-sm font-medium">
              Book Table
            </Link>
            <Link href="/contact" className="text-slate-300 hover:text-white text-sm font-medium">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {restaurant.name}
          </motion.h1>
          {restaurant.description && (
            <motion.p
              className="text-xl text-slate-400 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {restaurant.description}
            </motion.p>
          )}
          {restaurant.city && (
            <p className="text-slate-500 text-sm mb-10">
              <MapPin className="w-4 h-4 inline mr-1" />
              {restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''}
            </p>
          )}
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href={menuUrl}>
              <button
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:opacity-90"
                style={{ backgroundColor: primary }}
              >
                <UtensilsCrossed className="w-5 h-5" />
                View Menu
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href={bookingUrl}>
              <button
                className="inline-flex items-center gap-2 border-2 px-8 py-4 rounded-xl font-semibold transition-colors hover:bg-white/5"
                style={{ borderColor: primary, color: primary }}
              >
                <Calendar className="w-5 h-5" />
                Book a Table
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Rental Admin info — for restaurant owner */}
      <section className="border-t border-slate-800 py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-slate-500 text-sm mb-2">Restaurant owner?</p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium"
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
          <div className="flex items-center gap-2">
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 hover:text-white">
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
          <Link href="/" className="hover:text-white">
            Powered by Restro OS
          </Link>
        </div>
      </footer>
    </div>
  );
}

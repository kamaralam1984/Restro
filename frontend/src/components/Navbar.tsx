'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, LogOut, User, Store } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import LanguageSwitcher from './LanguageSwitcher';
import api from '@/services/api';

export default function Navbar() {
  const { cartItems } = useCart();
  const { user, logout, isAuthenticated } = useUser();
  const { restaurant: restaurantContext } = useRestaurantPage();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const showRestaurantBranding = restaurantContext && (pathname === '/menu' || pathname === '/booking' || pathname?.startsWith('/contact'));
  
  // Prevent hydration mismatch by only calculating after mount
  const itemCount = mounted ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

  useEffect(() => {
    setMounted(true);
    checkDatabaseStatus();
    const interval = setInterval(checkDatabaseStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      // api.get already returns response.data
      const data = await api.get<{ status: string; database?: { connected?: boolean } }>('/health', {
        timeout: 8000,
      });
      const connected = data?.database?.connected === true;
      setDbConnected(connected);
    } catch {
      setDbConnected(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isLandingPage = pathname === '/';
  const navLinks = showRestaurantBranding && restaurantContext
    ? [
        { href: `/r/${restaurantContext.slug}`, label: 'Home' },
        { href: `/menu?restaurant=${restaurantContext.slug}`, label: 'Menu' },
        { href: `/booking?restaurant=${restaurantContext.slug}`, label: 'Book Table' },
        { href: `/contact?restaurant=${restaurantContext.slug}`, label: 'Contact' },
      ]
    : isLandingPage
    ? [
        { href: '/#features', label: 'Features' },
        { href: '/#pricing', label: 'Pricing' },
        { href: '/contact', label: 'Contact' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/menu', label: 'Menu' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
      ];

  const primaryColor = showRestaurantBranding && restaurantContext?.primaryColor ? restaurantContext.primaryColor : '#ea580c';

  return (
    <motion.nav
      className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo — restaurant branding when on menu/booking with ?restaurant= */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={showRestaurantBranding && restaurantContext ? `/r/${restaurantContext.slug}` : '/'} className="flex items-center gap-3">
              {showRestaurantBranding && restaurantContext ? (
                <>
                  {restaurantContext.logo ? (
                    <Image src={restaurantContext.logo} alt={restaurantContext.name} width={48} height={48} className="rounded-xl object-cover" unoptimized />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}30`, border: `2px solid ${primaryColor}50` }}>
                      <Store className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-bold text-white">{restaurantContext.name}</div>
                    <div className="text-xs text-slate-400">Menu</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">Restro OS</div>
                    <div className="text-xs text-slate-400">{isLandingPage ? 'Restaurant Management' : 'Pure & Delicious'}</div>
                  </div>
                </>
              )}
            </Link>
          </motion.div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span
                      className={`text-white hover:text-orange-600 transition-colors ${
                        isActive ? 'text-orange-600' : ''
                      }`}
                    >
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-600 rounded-full"
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {!isLandingPage && (
              <>
                {/* Database Status Indicator */}
                <div className="flex items-center gap-2" title={dbConnected ? 'Database Connected' : 'Database Disconnected'}>
                  <div className="relative">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        dbConnected ? 'bg-green-500' : 'bg-red-500'
                      } ${dbConnected ? 'animate-pulse' : ''}`}
                    />
                    {dbConnected && (
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                    )}
                  </div>
                  <span className="hidden md:block text-xs text-slate-400">
                    {checkingStatus ? 'Checking...' : dbConnected ? 'DB Online' : 'DB Offline'}
                  </span>
                </div>
                <LanguageSwitcher />
                <Link href="/cart">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-white hover:text-orange-600 transition-colors">
                      Cart
                    </span>
                    <AnimatePresence>
                      {itemCount > 0 && (
                        <motion.span
                          className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          {itemCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:block text-sm">{user?.name}</span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:block">Logout</span>
                </motion.button>
              </div>
            ) : (
              <>
                <Link href="/admin/login">
                  <motion.button
                    className="text-white hover:text-orange-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href={isLandingPage ? '/restaurant/signup' : '/signup'}>
                  <motion.button
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLandingPage ? 'Start Free Trial' : 'Sign Up'}
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}


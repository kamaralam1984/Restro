'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, Star, Truck, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import { menuService, MenuItem } from '@/services/menu.service';
import api from '@/services/api';
import HeroCarousel from '@/components/HeroCarousel';

interface Testimonial {
  name: string;
  review: string;
  rating: number;
  image?: string;
}

export default function Home() {
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [testimonials] = useState<Testimonial[]>([
    {
      name: 'Fasul Sharma',
      review: 'Hot & fresh food on your doorstep',
      rating: 5,
    },
    {
      name: 'Neha Gupta',
      review: 'Great experience dining in, thy exceptional!',
      rating: 5,
    },
    {
      name: 'Manish Singh',
      review: 'Loved the grilled chicken. Will ta for sure!',
      rating: 5,
    },
  ]);

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    try {
      // Get top selling items from analytics
      const topItems = await api.get<any[]>('/analytics/top-selling', {
        params: { limit: '3' },
      });
      
      if (topItems && topItems.length > 0) {
        // Fetch full menu item details
        const items = await Promise.all(
          topItems.slice(0, 3).map(async (item: any) => {
            try {
              return await menuService.getMenuItem(item._id);
            } catch {
              return null;
            }
          })
        );
        setBestSellers(items.filter(Boolean) as MenuItem[]);
      } else {
        // Fallback: Get first 3 menu items
        const allItems = await menuService.getMenuItems();
        if (allItems && allItems.length > 0) {
          setBestSellers(allItems.slice(0, 3));
        } else {
          // Default best sellers if no items in database
          setBestSellers([
            {
              _id: '1',
              name: 'Chicken Butter Masala',
              description: 'Creamy and rich butter masala with tender chicken pieces',
              price: 190,
              category: 'main',
              isVeg: false,
              available: true,
              image: 'https://images.unsplash.com/photo-1601050690597-df0568f70946?w=400&q=80',
            },
            {
              _id: '2',
              name: 'Chicken Tikka Butter Masala',
              description: 'Boneless chicken tikka in creamy butter masala sauce',
              price: 190,
              category: 'main',
              isVeg: false,
              available: true,
              image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80',
            },
            {
              _id: '3',
              name: 'Restro OS Special',
              description: 'Our signature boneless chicken dish with special spices',
              price: 200,
              category: 'main',
              isVeg: false,
              available: true,
              image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
            },
          ]);
        }
      }
    } catch (error) {
      // Fallback: Get menu items
      try {
        const items = await menuService.getMenuItems();
        if (items && items.length > 0) {
          setBestSellers(items.slice(0, 3));
        } else {
          // Default best sellers
          setBestSellers([
            {
              _id: '1',
              name: 'Chicken Butter Masala',
              description: 'Creamy and rich butter masala with tender chicken pieces',
              price: 190,
              category: 'main',
              isVeg: false,
              available: true,
              image: 'https://images.unsplash.com/photo-1601050690597-df0568f70946?w=400&q=80',
            },
            {
              _id: '2',
              name: 'Chicken Tikka Butter Masala',
              description: 'Boneless chicken tikka in creamy butter masala sauce',
              price: 190,
              category: 'main',
              isVeg: false,
              available: true,
              image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80',
            },
            {
              _id: '3',
              name: 'Restro OS Special',
              description: 'Our signature boneless chicken dish with special spices',
              price: 200,
              category: 'main',
              isVeg: false,
              available: true,
              image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load best sellers:', err);
        // Set default items even on error
        setBestSellers([
          {
            _id: '1',
            name: 'Chicken Butter Masala',
            description: 'Creamy and rich butter masala with tender chicken pieces',
            price: 190,
            category: 'main',
            isVeg: false,
            available: true,
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70946?w=400&q=80',
          },
          {
            _id: '2',
            name: 'Chicken Tikka Butter Masala',
            description: 'Boneless chicken tikka in creamy butter masala sauce',
            price: 190,
            category: 'main',
            isVeg: false,
            available: true,
            image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80',
          },
          {
            _id: '3',
            name: 'Restro OS Special',
            description: 'Our signature boneless chicken dish with special spices',
            price: 200,
            category: 'main',
            isVeg: false,
            available: true,
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
          },
        ]);
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-orange-600 fill-orange-600' : 'text-slate-600'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Delicious Food.
            </h1>
            <div className="flex items-center gap-2">
              <h2 className="text-4xl md:text-5xl font-bold">
                Delivered{' '}
                <span className="text-orange-600">Hot & Fresh!</span>
              </h2>
              <ChefHat className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xl text-slate-300 max-w-lg">
              Order online or book a table and delicious meals at your comfort.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/menu">
                <motion.button
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Order Now
                </motion.button>
              </Link>
              <Link href="/booking">
                <motion.button
                  className="border-2 border-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book a Table
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right Image Carousel */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </section>

      {/* Our Best Sellers */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Best Sellers
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bestSellers.map((item, index) => (
              <motion.div
                key={item._id || item.id || index}
                className="bg-slate-800 rounded-xl overflow-hidden hover:shadow-2xl transition-shadow border border-slate-700"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative h-64 bg-slate-700">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-20 h-20 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isVeg ? 'bg-green-600' : 'bg-red-600'
                      } text-white`}
                    >
                      {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-orange-600 text-3xl font-bold">
                      ₹{item.price.toFixed(0)}
                    </p>
                    <span className="text-slate-500 text-sm">/ 2 pcs</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{item.description || 'Delicious and fresh'}</p>
                  <Link href="/menu">
                    <motion.button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Order Now
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Testimonials & Features */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-8">Why Choose Us?</h2>
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-900 rounded-xl p-6 border border-slate-800"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">
                          {testimonial.name}
                        </h4>
                        <p className="text-slate-300 mb-2">{testimonial.review}</p>
                        <div className="flex gap-1">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-8">Why Choose Us?</h2>
              <div className="space-y-6 mb-8">
                {[
                  {
                    icon: Truck,
                    title: 'Fast Delivery',
                    description: 'Hot & fresh food delivered to your doorsteps!',
                  },
                  {
                    icon: Calendar,
                    title: 'Table Booking',
                    description: 'Reserve your table and enjoy dining.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Online Payment',
                    description: 'Simple & secure delivery and payment dining.',
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex items-start gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-slate-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <Link href="/menu">
                <motion.button
                  className="w-full bg-slate-800 border-2 border-orange-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-600/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Menu
                  <ArrowRight className="w-5 h-5 text-orange-600" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ChefHat, Award, Users, Clock, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { icon: Users, value: '10K+', label: 'Happy Customers' },
    { icon: Award, value: '5+', label: 'Years Experience' },
    { icon: ChefHat, value: '50+', label: 'Menu Items' },
    { icon: Clock, value: '24/7', label: 'Online Ordering' },
  ];

  const values = [
    {
      icon: ChefHat,
      title: 'Fresh Ingredients',
      description: 'We source only the finest, locally sourced ingredients to ensure every dish is fresh and flavorful.',
    },
    {
      icon: Award,
      title: 'Expert Chefs',
      description: 'Our talented chefs bring years of experience and passion to create culinary masterpieces.',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We go above and beyond to make every dining experience memorable.',
    },
    {
      icon: Clock,
      title: 'Timely Service',
      description: 'Whether dining in or ordering online, we ensure your food is delivered hot and fresh, on time.',
    },
  ];

  const team = [
    {
      name: 'Chef Rajesh Kumar',
      role: 'Head Chef',
      image: '👨‍🍳',
      description: '15+ years of culinary excellence',
    },
    {
      name: 'Priya Sharma',
      role: 'Pastry Chef',
      image: '👩‍🍳',
      description: 'Specialist in desserts and baked goods',
    },
    {
      name: 'Amit Singh',
      role: 'Sous Chef',
      image: '👨‍🍳',
      description: 'Expert in Indian and Continental cuisine',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              About <span className="text-orange-600">Restro OS</span>
            </h1>
            <p className="text-xl text-slate-300">
              Pure & Delicious - Serving Excellence Since 2019
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-slate-300">
                <p>
                  Restro OS was born from a simple dream - to bring authentic, delicious food to every table. 
                  Founded in 2019, we started as a small family restaurant with a passion for culinary excellence.
                </p>
                <p>
                  Over the years, we've grown from a humble kitchen to a beloved restaurant known for our 
                  commitment to quality, freshness, and exceptional service. Every dish we serve is crafted 
                  with care, using only the finest ingredients.
                </p>
                <p>
                  Today, Restro OS stands as a testament to our dedication. We've served over 10,000 happy 
                  customers and continue to innovate while staying true to our roots - pure, delicious food 
                  that brings people together.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative h-96 bg-slate-800 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Restaurant Interior"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-orange-600 mb-2">{stat.value}</h3>
                  <p className="text-slate-400">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-600 transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-slate-400 text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="bg-slate-900 rounded-xl p-6 border border-slate-800 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-orange-600 mb-2">{member.role}</p>
                <p className="text-slate-400 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Visit Us
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="bg-slate-800 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
              <p className="text-slate-400 text-sm">
                123 Main Street<br />
                City, State 12345<br />
                India
              </p>
            </motion.div>
            <motion.div
              className="bg-slate-800 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Phone className="w-8 h-8 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
              <p className="text-slate-400 text-sm">
                +1 (555) 123-4567<br />
                +1 (555) 123-4568
              </p>
            </motion.div>
            <motion.div
              className="bg-slate-800 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Mail className="w-8 h-8 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
              <p className="text-slate-400 text-sm">
                info@restroos.com<br />
                support@restroos.com
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-12 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            <motion.a
              href="#"
              className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Facebook className="w-6 h-6 text-white" />
            </motion.a>
            <motion.a
              href="#"
              className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Instagram className="w-6 h-6 text-white" />
            </motion.a>
            <motion.a
              href="#"
              className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Twitter className="w-6 h-6 text-white" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Experience Restro OS?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Book a table or order online today!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/booking">
                <motion.button
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book a Table
                </motion.button>
              </Link>
              <Link href="/menu">
                <motion.button
                  className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors border-2 border-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Menu
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, CartAddOn } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVeg: boolean;
  addOns?: { name: string; price: number; available: boolean }[];
}

interface EnhancedMenuCardProps {
  item: MenuItem;
  index?: number;
}

export default function EnhancedMenuCard({ item, index = 0 }: EnhancedMenuCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [showAddOns, setShowAddOns] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<CartAddOn[]>([]);
  const [customizations, setCustomizations] = useState('');

  const itemId = item._id || item.id || '';

  const handleAddToCart = () => {
    addToCart(
      {
        id: itemId,
        name: item.name,
        price: item.price,
        image: item.image,
      },
      selectedAddOns.length > 0 ? selectedAddOns : undefined,
      customizations || undefined
    );
    setSelectedAddOns([]);
    setCustomizations('');
    setShowAddOns(false);
  };

  const toggleAddOn = (addOn: { name: string; price: number }) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.name === addOn.name);
      if (exists) {
        return prev.filter((a) => a.name !== addOn.name);
      }
      return [...prev, addOn];
    });
  };

  return (
    <motion.div
      className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      {item.image && (
        <motion.img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white">{item.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            item.isVeg ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {item.isVeg ? '🟢 ' + t('veg') : '🔴 ' + t('nonVeg')}
          </span>
        </div>
        <p className="text-slate-400 text-sm mb-4">{item.description}</p>
        
        {item.addOns && item.addOns.length > 0 && (
          <button
            onClick={() => setShowAddOns(!showAddOns)}
            className="text-orange-600 text-sm mb-2 hover:text-orange-500 transition-colors font-medium"
          >
            {showAddOns ? 'Hide' : 'Show'} Add-ons ({item.addOns.length})
          </button>
        )}

        <AnimatePresence>
          {showAddOns && item.addOns && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 space-y-2"
            >
              {item.addOns.filter(a => a.available).map((addOn) => (
                <label
                  key={addOn.name}
                  className="flex items-center justify-between p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors bg-slate-900"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAddOns.some((a) => a.name === addOn.name)}
                      onChange={() => toggleAddOn(addOn)}
                      className="mr-3 w-4 h-4 text-orange-600 bg-slate-800 border-slate-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-white">{addOn.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">+₹{addOn.price.toFixed(0)}</span>
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Special instructions (optional)"
            value={customizations}
            onChange={(e) => setCustomizations(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-3xl font-bold text-orange-600">
              ₹{item.price.toFixed(0)}
            </span>
            <span className="text-slate-500 text-sm ml-2">/ 2 pcs</span>
          </div>
          <motion.button
            onClick={handleAddToCart}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('addToCart')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}


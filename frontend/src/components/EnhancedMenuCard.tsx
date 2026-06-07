'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
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
  /** Restaurant slug for cart scope; required for add-to-cart to work. */
  restaurantSlug?: string;
}

export default function EnhancedMenuCard({ item, index = 0, restaurantSlug }: EnhancedMenuCardProps) {
  const { addToCart, getCartItems, openCartDrawer } = useCart();
  const { t } = useLanguage();
  const [showAddOns, setShowAddOns] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<CartAddOn[]>([]);
  const [customizations, setCustomizations] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const itemId = item._id || item.id || '';

  const inCartQty = getCartItems(restaurantSlug).find((i) => i.id === itemId)?.quantity ?? 0;

  const handleAddToCart = () => {
    if (!restaurantSlug) return;
    addToCart(
      {
        id: itemId,
        name: item.name,
        price: item.price,
        image: item.image,
      },
      restaurantSlug,
      selectedAddOns.length > 0 ? selectedAddOns : undefined,
      customizations || undefined
    );
    toast.success(`${item.name} added to cart!`, {
      duration: 1500,
      style: {
        background: '#141414',
        color: '#f8f4ed',
        border: '1px solid rgba(200,151,42,0.3)',
      },
    });
    openCartDrawer();
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
    <>
      <Toaster position="top-right" />
      <motion.div
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.15)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        {item.image && (
          <motion.img
            src={item.image}
            alt={item.name}
            style={{ width: '100%', height: 192, objectFit: 'cover', display: 'block' }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ color: '#f8f4ed', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>{item.name}</h3>
            <span
              style={{
                background: item.isVeg ? '#16a34a' : '#dc2626',
                color: '#fff',
                padding: '2px 12px',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {item.isVeg ? '🟢 ' + t('veg') : '🔴 ' + t('nonVeg')}
            </span>
          </div>

          <p style={{ color: '#a89070', fontSize: '0.875rem', marginBottom: '1rem' }}>{item.description}</p>

          {item.addOns && item.addOns.length > 0 && (
            <button
              onClick={() => setShowAddOns(!showAddOns)}
              style={{
                background: 'none',
                border: 'none',
                color: '#c8972a',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
              }}
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
                style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflow: 'hidden' }}
              >
                {item.addOns.filter((a) => a.available).map((addOn) => (
                  <label
                    key={addOn.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: '#1c1c1c',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedAddOns.some((a) => a.name === addOn.name)}
                        onChange={() => toggleAddOn(addOn)}
                        style={{ marginRight: '0.75rem', width: 16, height: 16, accentColor: '#c8972a' }}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#f8f4ed' }}>{addOn.name}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#c8972a' }}>+₹{addOn.price.toFixed(0)}</span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginBottom: '0.5rem' }}>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a89070',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: 0,
                fontWeight: 500,
              }}
            >
              {showInstructions ? '▲ Hide' : '▼ Special instructions'}
            </button>
          </div>

          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginBottom: '1rem' }}
              >
                <input
                  type="text"
                  placeholder="Special instructions (optional)"
                  value={customizations}
                  onChange={(e) => setCustomizations(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1c1c1c',
                    border: '1px solid rgba(200,151,42,0.2)',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    color: '#f8f4ed',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#c8972a', fontWeight: 800, fontSize: '1.75rem' }}>
              ₹{item.price.toFixed(0)}
            </span>
            <motion.button
              onClick={handleAddToCart}
              style={{
                background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                color: '#080808',
                padding: '0.5rem 1.5rem',
                borderRadius: 8,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {inCartQty > 0 ? `Add More (${inCartQty})` : t('addToCart')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

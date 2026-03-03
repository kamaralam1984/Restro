'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import { X } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { restaurant } = useRestaurantPage();
  const { getCartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const restaurantSlug = restaurant?.slug;
  const cartItems = getCartItems(restaurantSlug);
  const totalPrice = getTotalPrice(restaurantSlug);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center space-x-4 border-b pb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600 text-sm">₹{item.price.toFixed(0)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => restaurantSlug && updateQuantity(item.id, item.quantity - 1, restaurantSlug)}
                        className="w-8 h-8 rounded border hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => restaurantSlug && updateQuantity(item.id, item.quantity + 1, restaurantSlug)}
                        className="w-8 h-8 rounded border hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <motion.button
                      onClick={() => restaurantSlug && removeFromCart(item.id, restaurantSlug)}
                      className="text-red-600 hover:text-red-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Remove
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold">₹{totalPrice.toFixed(0)}</span>
              </div>
              <Link
                href={restaurantSlug ? `/checkout?restaurant=${encodeURIComponent(restaurantSlug)}` : '/cart'}
                onClick={onClose}
              >
                <motion.button
                  className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceed to Checkout
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
}


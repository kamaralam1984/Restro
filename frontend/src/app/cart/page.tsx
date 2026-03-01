'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  IndianRupee,
  Tag,
  Truck,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge] = useState(50); // Fixed delivery charge
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Calculate item total (price + add-ons) * quantity
  const getItemTotal = (item: CartItem) => {
    const basePrice = item.price * item.quantity;
    const addOnsPrice = (item.addOns || []).reduce(
      (sum, addOn) => sum + addOn.price * item.quantity,
      0
    );
    return basePrice + addOnsPrice;
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + getItemTotal(item), 0);

  // Calculate total
  const total = subtotal + deliveryCharge - discount;

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const validCoupons: { [key: string]: number } = {
        WELCOME10: 10,
        SAVE20: 20,
        FIRST50: 50,
        FLAT100: 100,
      };

      const upperCode = couponCode.toUpperCase().trim();
      
      if (validCoupons[upperCode]) {
        const discountAmount = Math.min(validCoupons[upperCode], subtotal * 0.3); // Max 30% discount
        setDiscount(discountAmount);
        setAppliedCoupon(upperCode);
        toast.success(`Coupon "${upperCode}" applied!`);
      } else {
        toast.error('Invalid coupon code');
      }
      
      setIsApplyingCoupon(false);
    }, 500);
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 py-12 px-4">
        <Toaster position="top-right" />
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-16 h-16 text-slate-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start adding delicious items
              from our menu!
            </p>
            <motion.button
              onClick={() => router.push('/menu')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-5 h-5" />
              Browse Menu
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <Toaster position="top-right" />
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Shopping Cart</h1>
              <p className="text-slate-400">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            {cartItems.length > 0 && (
              <motion.button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                    toast.success('Cart cleared');
                  }
                }}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </motion.button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item, index) => {
                // Create unique key for each cart item
                const itemKey = `${item.id}-${index}-${JSON.stringify(item.addOns || [])}-${item.customizations || ''}`;
                return (
                <motion.div
                  key={itemKey}
                  className="bg-slate-900 rounded-xl p-6 border border-slate-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                          <p className="text-orange-600 font-semibold text-lg">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Add-ons */}
                      {item.addOns && item.addOns.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-400 mb-1">Add-ons:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.addOns.map((addOn, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                              >
                                {addOn.name} (+{formatCurrency(addOn.price)})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customizations */}
                      {item.customizations && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-400 mb-1">Special Instructions:</p>
                          <p className="text-xs text-slate-300 italic">{item.customizations}</p>
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">Quantity:</span>
                          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Item Total</p>
                          <p className="text-lg font-bold text-white">
                            {formatCurrency(getItemTotal(item))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-slate-900 rounded-xl p-6 border border-slate-800 sticky top-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Try: WELCOME10, SAVE20, FIRST50, FLAT100
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">
                          {appliedCoupon} Applied
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-400 hover:text-green-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-green-400 mt-1">
                      You saved {formatCurrency(discount)}!
                    </p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Delivery Charge
                  </span>
                  <span>{formatCurrency(deliveryCharge)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-400">
                  Free delivery on orders above ₹500. You're ₹{500 - subtotal} away!
                </p>
              </div>

              {/* Checkout Button */}
              <motion.button
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              {/* Continue Shopping */}
              <button
                onClick={() => router.push('/menu')}
                className="w-full mt-3 text-slate-400 hover:text-white text-sm transition-colors"
              >
                ← Continue Shopping
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

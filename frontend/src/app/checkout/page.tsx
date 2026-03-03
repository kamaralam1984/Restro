'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { orderService } from '@/services/order.service';
import { loadRazorpayScript } from '@/utils/razorpay';
import api from '@/services/api';

function CheckoutPageContent() {
  const { getCartItems, getTotalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get('restaurant') ?? undefined;

  const cartItems = getCartItems(restaurantSlug);
  const itemsSubtotal = getTotalPrice(restaurantSlug);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    tableNumber: '',
    notes: '',
  });
  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [deliveryCharge] = useState<number>(50);

  useEffect(() => {
    setMounted(true);
    setRazorpayKey(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '');
  }, []);

  useEffect(() => {
    if (!restaurantSlug) {
      setTaxRate(0);
      return;
    }
    api
      .get<{ taxRate?: number }>(`/restaurants/by-slug/${restaurantSlug}`)
      .then((data) => {
        const rate = typeof data.taxRate === 'number' && data.taxRate >= 0 ? data.taxRate : 0;
        setTaxRate(rate);
      })
      .catch(() => setTaxRate(0));
  }, [restaurantSlug]);

  const gstAmount = Math.round(itemsSubtotal * (taxRate / 100));
  const finalTotal = itemsSubtotal + gstAmount + deliveryCharge;

  // Redirect to cart if no restaurant or empty cart
  useEffect(() => {
    if (!mounted) return;
    if (!restaurantSlug || cartItems.length === 0) {
      router.replace(restaurantSlug ? `/cart?restaurant=${encodeURIComponent(restaurantSlug)}` : '/cart');
    }
  }, [mounted, restaurantSlug, cartItems.length, router]);

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (paymentMethod === 'cod') {
      await placeCODOrder();
    } else {
      await placeOnlineOrder();
    }
  };

  const placeCODOrder = async () => {
    try {
      setProcessing(true);
      
      // Validate cart is not empty
      if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items to your cart.');
        setProcessing(false);
        return;
      }

      // Validate customer info
      if (!customerInfo.name || !customerInfo.phone) {
        alert('Please fill in all required fields (Name and Phone)');
        setProcessing(false);
        return;
      }

      const order = await orderService.createOrder({
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
          addOns: item.addOns || [],
          customizations: item.customizations || '',
        })),
        total: finalTotal,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || '',
        customerPhone: customerInfo.phone,
        tableNumber: customerInfo.tableNumber || '',
        notes: customerInfo.notes || '',
        paymentMethod: 'cash' as const,
      });

      setPaymentSuccess(true);
      if (restaurantSlug) clearCart(restaurantSlug);
      setTimeout(() => {
        router.push(restaurantSlug ? `/r/${restaurantSlug}` : '/');
      }, 3000);
    } catch (error: any) {
      console.error('COD Order failed:', error);
      // Extract error message from different possible sources
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const placeOnlineOrder = async () => {
    try {
      setProcessing(true);
      
      // Validate cart is not empty
      if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items to your cart.');
        setProcessing(false);
        return;
      }

      // Create order first
      const order = await orderService.createOrder({
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
          addOns: item.addOns || [],
          customizations: item.customizations || '',
        })),
        total: finalTotal,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || '',
        customerPhone: customerInfo.phone,
        tableNumber: customerInfo.tableNumber || '',
        notes: customerInfo.notes || '',
        paymentMethod: 'online',
      });

      // Load Razorpay script
      await loadRazorpayScript();

      // Create Razorpay order via backend
      const razorpayOrderResponse = await api.post('/payments/create-order', {
        orderId: order.id || (order as any)._id,
        amount: finalTotal,
      });
      
      const razorpayOrder = razorpayOrderResponse as { amount: number; currency: string; orderId: string };

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Restro OS',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment via backend
            await api.post('/payments/verify', {
              razorpayOrderId: razorpayOrder.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              dbOrderId: order.id || (order as any)._id,
            });

            // Payment verification already updates the order status in backend
            // No need to call separate update endpoint

            setPaymentSuccess(true);
            if (restaurantSlug) clearCart(restaurantSlug);
            setTimeout(() => {
              router.push(restaurantSlug ? `/r/${restaurantSlug}` : '/');
            }, 3000);
          } catch (error: any) {
            console.error('Payment verification failed:', error);
            const errorMessage = error?.response?.data?.error || error?.message || 'Payment verification failed. Please contact support.';
            alert(errorMessage);
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment failed:', error);
      const errorMessage = error?.message || error?.response?.data?.error || 'Payment failed. Please try again.';
      alert(errorMessage);
      setProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
        >
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p>Thank you for your order. We&apos;ll notify you when it&apos;s ready.</p>
        </motion.div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">{t('checkout')}</h1>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!restaurantSlug || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">{t('checkout')}</h1>
        <div className="text-center py-8 text-gray-500">Redirecting to cart...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t('checkout')}</h1>

      {/* Customer Information */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name *"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Phone *"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Table Number (optional)"
            value={customerInfo.tableNumber}
            onChange={(e) => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <textarea
            placeholder="Special Instructions (optional)"
            value={customerInfo.notes}
            onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            rows={3}
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <div className="space-y-2">
          <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
              className="mr-3"
            />
            <div>
              <div className="font-semibold">{t('onlinePayment')}</div>
              <div className="text-sm text-gray-600">Pay securely with Razorpay</div>
            </div>
          </label>
          <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="mr-3"
            />
            <div>
              <div className="font-semibold">{t('cod')}</div>
              <div className="text-sm text-gray-600">Pay when you receive your order</div>
            </div>
          </label>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{itemsSubtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST ({taxRate || 0}%)</span>
              <span>₹{gstAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>₹{deliveryCharge.toFixed(0)}</span>
            </div>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-xl">
            <span>{t('total')}</span>
            <span>₹{finalTotal.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <motion.button
        onClick={handlePlaceOrder}
        disabled={processing || paymentSuccess}
        className={`w-full py-3 rounded-lg font-semibold text-white ${
          processing || paymentSuccess
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        whileHover={!processing && !paymentSuccess ? { scale: 1.02 } : {}}
        whileTap={!processing && !paymentSuccess ? { scale: 0.98 } : {}}
      >
        {processing ? 'Processing...' : paymentSuccess ? 'Order Placed!' : t('placeOrder')}
      </motion.button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center py-8 text-gray-500">Loading...</div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

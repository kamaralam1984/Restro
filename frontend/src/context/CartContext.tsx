'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartAddOn {
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addOns?: CartAddOn[];
  customizations?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, addOns?: CartAddOn[], customizations?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'restro_os_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, addOns?: CartAddOn[], customizations?: string) => {
    setCartItems((prev) => {
      // Check if item with same add-ons and customizations exists
      const existingItem = prev.find((i) => 
        i.id === item.id && 
        JSON.stringify(i.addOns) === JSON.stringify(addOns) &&
        i.customizations === customizations
      );
      
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id && 
          JSON.stringify(i.addOns) === JSON.stringify(addOns) &&
          i.customizations === customizations
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, addOns, customizations }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.price * item.quantity;
      const addOnsPrice = (item.addOns || []).reduce((sum, addOn) => sum + addOn.price, 0) * item.quantity;
      return total + itemPrice + addOnsPrice;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


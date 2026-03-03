'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

/** Cart is stored per restaurant slug so each restaurant's orders stay separate. */
type CartsByRestaurant = Record<string, CartItem[]>;

const CART_STORAGE_KEY = 'restro_os_cart';

function loadCartsFromStorage(): CartsByRestaurant {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

interface CartContextType {
  /** Get items for a restaurant's cart. Pass restaurant slug; without slug returns []. */
  getCartItems: (restaurantSlug: string | undefined) => CartItem[];
  /** Total quantity count for a restaurant's cart. */
  getCartCount: (restaurantSlug: string | undefined) => number;
  /** Subtotal for a restaurant's cart (items + add-ons). */
  getTotalPrice: (restaurantSlug: string | undefined) => number;
  addToCart: (
    item: Omit<CartItem, 'quantity'>,
    restaurantSlug: string,
    addOns?: CartAddOn[],
    customizations?: string
  ) => void;
  removeFromCart: (id: string, restaurantSlug: string) => void;
  updateQuantity: (id: string, quantity: number, restaurantSlug: string) => void;
  clearCart: (restaurantSlug: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartsByRestaurant, setCartsByRestaurant] = useState<CartsByRestaurant>(loadCartsFromStorage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartsByRestaurant));
    }
  }, [cartsByRestaurant]);

  const getCartItems = useCallback(
    (restaurantSlug: string | undefined): CartItem[] => {
      if (!restaurantSlug) return [];
      return cartsByRestaurant[restaurantSlug] ?? [];
    },
    [cartsByRestaurant]
  );

  const getCartCount = useCallback(
    (restaurantSlug: string | undefined): number => {
      return getCartItems(restaurantSlug).reduce((sum, i) => sum + i.quantity, 0);
    },
    [getCartItems]
  );

  const getTotalPrice = useCallback(
    (restaurantSlug: string | undefined): number => {
      return getCartItems(restaurantSlug).reduce((total, item) => {
        const itemPrice = item.price * item.quantity;
        const addOnsPrice = (item.addOns ?? []).reduce((s, a) => s + a.price, 0) * item.quantity;
        return total + itemPrice + addOnsPrice;
      }, 0);
    },
    [getCartItems]
  );

  const addToCart = useCallback(
    (
      item: Omit<CartItem, 'quantity'>,
      restaurantSlug: string,
      addOns?: CartAddOn[],
      customizations?: string
    ) => {
      if (!restaurantSlug) return;
      setCartsByRestaurant((prev) => {
        const list = prev[restaurantSlug] ?? [];
        const existing = list.find(
          (i) =>
            i.id === item.id &&
            JSON.stringify(i.addOns) === JSON.stringify(addOns) &&
            i.customizations === customizations
        );
        const nextList = existing
          ? list.map((i) =>
              i.id === item.id &&
              JSON.stringify(i.addOns) === JSON.stringify(addOns) &&
              i.customizations === customizations
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          : [...list, { ...item, quantity: 1, addOns, customizations }];
        return { ...prev, [restaurantSlug]: nextList };
      });
    },
    []
  );

  const removeFromCart = useCallback((id: string, restaurantSlug: string) => {
    if (!restaurantSlug) return;
    setCartsByRestaurant((prev) => {
      const list = prev[restaurantSlug] ?? [];
      const nextList = list.filter((i) => i.id !== id);
      if (nextList.length === 0) {
        const next = { ...prev };
        delete next[restaurantSlug];
        return next;
      }
      return { ...prev, [restaurantSlug]: nextList };
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, restaurantSlug: string) => {
    if (!restaurantSlug) return;
    if (quantity <= 0) {
      removeFromCart(id, restaurantSlug);
      return;
    }
    setCartsByRestaurant((prev) => {
      const list = prev[restaurantSlug] ?? [];
      const nextList = list.map((i) => (i.id === id ? { ...i, quantity } : i));
      return { ...prev, [restaurantSlug]: nextList };
    });
  }, [removeFromCart]);

  const clearCart = useCallback((restaurantSlug: string) => {
    if (!restaurantSlug) return;
    setCartsByRestaurant((prev) => {
      const next = { ...prev };
      delete next[restaurantSlug];
      return next;
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        getCartItems,
        getCartCount,
        getTotalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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

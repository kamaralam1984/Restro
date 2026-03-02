'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface RestaurantPageInfo {
  slug: string;
  name: string;
  logo?: string;
  primaryColor?: string;
}

interface RestaurantPageContextType {
  restaurant: RestaurantPageInfo | null;
  setRestaurant: (info: RestaurantPageInfo | null) => void;
}

const RestaurantPageContext = createContext<RestaurantPageContextType | undefined>(undefined);

export function RestaurantPageProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantPageInfo | null>(null);
  return (
    <RestaurantPageContext.Provider value={{ restaurant, setRestaurant }}>
      {children}
    </RestaurantPageContext.Provider>
  );
}

export function useRestaurantPage() {
  const context = useContext(RestaurantPageContext);
  if (context === undefined) {
    throw new Error('useRestaurantPage must be used within RestaurantPageProvider');
  }
  return context;
}

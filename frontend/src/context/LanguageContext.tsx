'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'es' | 'fr';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    menu: 'Menu',
    cart: 'Cart',
    checkout: 'Checkout',
    booking: 'Book Table',
    welcome: 'Welcome',
    veg: 'Veg',
    nonVeg: 'Non-Veg',
    addToCart: 'Add to Cart',
    placeOrder: 'Place Order',
    cod: 'Cash on Delivery',
    onlinePayment: 'Online Payment',
    total: 'Total',
    orderNow: 'Order Now',
    bookTable: 'Book Table',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    numberOfGuests: 'Number of Guests',
    specialRequests: 'Special Requests',
  },
  hi: {
    menu: 'मेनू',
    cart: 'कार्ट',
    checkout: 'चेकआउट',
    booking: 'टेबल बुक करें',
    welcome: 'स्वागत है',
    veg: 'शाकाहारी',
    nonVeg: 'मांसाहारी',
    addToCart: 'कार्ट में जोड़ें',
    placeOrder: 'ऑर्डर करें',
    cod: 'कैश ऑन डिलीवरी',
    onlinePayment: 'ऑनलाइन भुगतान',
    total: 'कुल',
    orderNow: 'अभी ऑर्डर करें',
    bookTable: 'टेबल बुक करें',
    selectDate: 'तारीख चुनें',
    selectTime: 'समय चुनें',
    numberOfGuests: 'मेहमानों की संख्या',
    specialRequests: 'विशेष अनुरोध',
  },
  es: {
    menu: 'Menú',
    cart: 'Carrito',
    checkout: 'Pago',
    booking: 'Reservar Mesa',
    welcome: 'Bienvenido',
    veg: 'Vegetariano',
    nonVeg: 'No Vegetariano',
    addToCart: 'Agregar al Carrito',
    placeOrder: 'Realizar Pedido',
    cod: 'Pago Contra Entrega',
    onlinePayment: 'Pago en Línea',
    total: 'Total',
    orderNow: 'Ordenar Ahora',
    bookTable: 'Reservar Mesa',
    selectDate: 'Seleccionar Fecha',
    selectTime: 'Seleccionar Hora',
    numberOfGuests: 'Número de Invitados',
    specialRequests: 'Solicitudes Especiales',
  },
  fr: {
    menu: 'Menu',
    cart: 'Panier',
    checkout: 'Paiement',
    booking: 'Réserver une Table',
    welcome: 'Bienvenue',
    veg: 'Végétarien',
    nonVeg: 'Non Végétarien',
    addToCart: 'Ajouter au Panier',
    placeOrder: 'Passer la Commande',
    cod: 'Paiement à la Livraison',
    onlinePayment: 'Paiement en Ligne',
    total: 'Total',
    orderNow: 'Commander Maintenant',
    bookTable: 'Réserver une Table',
    selectDate: 'Sélectionner la Date',
    selectTime: 'Sélectionner l\'Heure',
    numberOfGuests: 'Nombre d\'Invités',
    specialRequests: 'Demandes Spéciales',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: { [key: string]: string };
  t: (key: string) => string;
  fontFamily: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with 'en' to ensure server and client match on initial render
  const [language, setLanguage] = useState<Language>('en');

  // Sync language from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['en', 'hi', 'es', 'fr'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
        document.documentElement.lang = savedLanguage;
        // Set font family based on language
        if (savedLanguage === 'hi') {
          document.documentElement.style.fontFamily = "'Noto Sans Devanagari', 'Mukta', sans-serif";
        } else {
          document.documentElement.style.fontFamily = 'inherit';
        }
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      // Set font family based on language
      if (lang === 'hi') {
        document.documentElement.style.fontFamily = "'Noto Sans Devanagari', 'Mukta', sans-serif";
      } else {
        document.documentElement.style.fontFamily = 'inherit';
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Get font family for current language
  const getFontFamily = (): string => {
    if (language === 'hi') {
      return "'Noto Sans Devanagari', 'Mukta', sans-serif";
    }
    return 'inherit';
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        translations: translations[language],
        t,
        fontFamily: getFontFamily(),
      }}
    >
      <div style={{ fontFamily: getFontFamily() }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


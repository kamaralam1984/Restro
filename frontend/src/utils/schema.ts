export interface RestaurantSchema {
  '@context': string;
  '@type': string;
  name: string;
  image?: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  servesCuisine: string;
  priceRange: string;
  openingHours: string[];
}

export interface MenuItemSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image?: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
}

export function generateRestaurantSchema(): RestaurantSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Restro OS',
    image: '/og-image.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',
      addressLocality: 'City',
      addressRegion: 'State',
      postalCode: '12345',
      addressCountry: 'IN',
    },
    telephone: '+1-555-123-4567',
    servesCuisine: 'Fine Dining',
    priceRange: '₹₹₹',
    openingHours: [
      'Mo-Sa 11:00-23:00',
    ],
  };
}

export function generateMenuItemSchema(item: {
  name: string;
  description: string;
  price: number;
  image?: string;
}): MenuItemSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    image: item.image,
    offers: {
      '@type': 'Offer',
      price: item.price.toString(),
      priceCurrency: 'INR',
    },
  };
}


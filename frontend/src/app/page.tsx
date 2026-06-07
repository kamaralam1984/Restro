import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HeroSlider, CategoryGrid, DealsSection, MenuSection, BookingSection, RestaurantThemeSwitcher } from '@/components/home';
import { ROISection, TestimonialsSection, FinalCTASection } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Restro OS — Premium Restaurant | Order Online | Reserve Table',
  description:
    'Experience fine dining redefined. Order fresh food online, browse our full menu, book your table — all at Restro OS Premium Restaurant. Burgers, Pizzas, Biryani & more.',
  keywords: [
    'order food online India',
    'restaurant table booking',
    'premium restaurant near me',
    'burger pizza biryani order',
    'online food delivery India',
    'restaurant reservation',
    'restro os restaurant',
    'best restaurant deals',
  ],
  openGraph: {
    title: 'Restro OS — Premium Restaurant | Order Online',
    description: 'Fresh food, bold flavors, premium experience. Order online or reserve your table today.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://restroos.com',
  },
};

export default function Home() {
  return (
    <div style={{ background: 'var(--rb-bg)' }} data-theme-transition>
      <HeroSlider />
      <CategoryGrid />
      <DealsSection />
      <Suspense fallback={null}><MenuSection /></Suspense>
      <BookingSection />
      <ROISection />
      <TestimonialsSection />
      <FinalCTASection />
      <RestaurantThemeSwitcher />
    </div>
  );
}

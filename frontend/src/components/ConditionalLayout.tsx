'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * On /r/[slug] (restaurant storefront), render only the page — no platform Navbar/Footer.
 * Elsewhere, show full platform layout.
 */
export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRestaurantStorefront = pathname?.startsWith('/r/');

  if (isRestaurantStorefront) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}

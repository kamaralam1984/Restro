'use client';

import { usePathname } from 'next/navigation';
import WhatsAppButton from './WhatsAppButton';

export default function WhatsAppButtonWrapper() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <WhatsAppButton />;
}

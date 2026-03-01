'use client';

import { usePathname } from 'next/navigation';
import AdminLayoutComponent from '@/components/admin/AdminLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/super/login' || pathname === '/admin/master/login';
  const isSuperPanel = pathname?.startsWith('/admin/super');
  const isMasterPanel = pathname?.startsWith('/admin/master');

  if (isLoginPage) return <>{children}</>;
  if (isSuperPanel || isMasterPanel) return <>{children}</>;

  return <AdminLayoutComponent panelType="rental">{children}</AdminLayoutComponent>;
}


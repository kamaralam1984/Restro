'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/super/login';

  if (isLoginPage) return <>{children}</>;
  return <AdminLayout panelType="super">{children}</AdminLayout>;
}

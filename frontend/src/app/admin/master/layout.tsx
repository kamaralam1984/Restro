'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function MasterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/master/login';

  if (isLoginPage) return <>{children}</>;
  return <AdminLayout panelType="master">{children}</AdminLayout>;
}

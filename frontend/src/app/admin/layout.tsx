'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayoutComponent from '@/components/admin/AdminLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/super/login' || pathname === '/admin/master/login';
  const isSuperPanel = pathname?.startsWith('/admin/super');
  const isMasterPanel = pathname?.startsWith('/admin/master');

  // Staff/manager/cashier must use staff panel, not admin panel
  useEffect(() => {
    if (isLoginPage || isSuperPanel || isMasterPanel) {
      setChecked(true);
      return;
    }
    const stored = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    if (!stored) {
      setChecked(true);
      return;
    }
    try {
      const admin = JSON.parse(stored);
      if (admin.role && !['admin', 'super_admin', 'master_admin'].includes(admin.role)) {
        router.replace('/staff');
        return;
      }
    } catch {}
    setChecked(true);
  }, [pathname, isLoginPage, isSuperPanel, isMasterPanel, router]);

  if (isLoginPage) return <>{children}</>;
  if (isSuperPanel || isMasterPanel) return <>{children}</>;
  if (!checked) return null;

  return <AdminLayoutComponent panelType="rental">{children}</AdminLayoutComponent>;
}


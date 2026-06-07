'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === '/admin/super/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    const stored = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    if (!stored) {
      router.replace('/admin/super/login');
      return;
    }
    try {
      const admin = JSON.parse(stored);
      if (!['super_admin', 'master_admin'].includes(admin.role)) {
        router.replace('/admin/dashboard');
        return;
      }
    } catch {
      router.replace('/admin/super/login');
      return;
    }
    setChecked(true);
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!checked) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return <>{children}</>;
}

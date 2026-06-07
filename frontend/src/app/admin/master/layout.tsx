'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function MasterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === '/admin/master/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    const stored = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    if (!stored) {
      router.replace('/admin/master/login');
      return;
    }
    try {
      const admin = JSON.parse(stored);
      if (admin.role !== 'master_admin') {
        router.replace('/admin/dashboard');
        return;
      }
    } catch {
      router.replace('/admin/master/login');
      return;
    }
    setChecked(true);
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!checked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#080808' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#c8972a', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#a89070' }}>
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

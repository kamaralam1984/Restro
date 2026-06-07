'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (!stored) {
      router.replace('/admin/login');
      return;
    }
    try {
      const admin = JSON.parse(stored);
      if (admin.role === 'super_admin' || admin.role === 'master_admin') {
        router.replace('/admin/super/restaurants');
      } else {
        router.replace('/admin/dashboard');
      }
    } catch {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div
        style={{
          width: 40, height: 40,
          border: '3px solid rgba(200,151,42,0.2)',
          borderTopColor: '#c8972a',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

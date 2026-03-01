'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayoutComponent from '@/components/admin/AdminLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}


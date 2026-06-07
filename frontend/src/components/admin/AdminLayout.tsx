'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar, { PanelType } from './Sidebar';
import { LogOut, Shield, ChefHat } from 'lucide-react';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import api from '@/services/api';

export interface AdminUser {
  name?: string;
  email?: string;
  role?: string;
  restaurantId?: string;
}

interface AdminLayoutProps {
  children: ReactNode;
  /** 'rental' = restaurant panel; 'super' | 'master' = platform panel (different link) */
  panelType?: PanelType;
}

export default function AdminLayout({ children, panelType = 'rental' }: AdminLayoutProps) {
  const router = useRouter();
  const { setRestaurant } = useRestaurantPage();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // When rental admin is in admin panel, set restaurant context so Navbar shows their branding
  useEffect(() => {
    if (panelType !== 'rental' || !adminUser) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get<{ slug?: string; name?: string; logo?: string; primaryColor?: string }>('/restaurants/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((data) => {
        if (data?.slug && data?.name) {
          setRestaurant({
            slug: data.slug,
            name: data.name,
            logo: data.logo,
            primaryColor: data.primaryColor,
          });
        }
      })
      .catch(() => {});
    return () => setRestaurant(null);
  }, [panelType, adminUser, setRestaurant]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('admin');
    if (!token || !stored) {
      const loginUrl = panelType === 'super' ? '/admin/super/login' : panelType === 'master' ? '/admin/master/login' : '/admin/login';
      router.replace(loginUrl);
      return;
    }
    try {
      const user = JSON.parse(stored);
      setAdminUser(user);
      if (panelType === 'rental') {
        if (user.role === 'super_admin') {
          router.replace('/admin/super/restaurants');
          return;
        }
        if (user.role === 'master_admin') {
          router.replace('/admin/master/restaurants');
          return;
        }
      }
      if (panelType === 'super' && user.role !== 'super_admin') {
        router.replace('/admin/super/login');
        return;
      }
      if (panelType === 'master' && user.role !== 'master_admin') {
        router.replace('/admin/master/login');
        return;
      }
    } catch {
      const loginUrl = panelType === 'super' ? '/admin/super/login' : panelType === 'master' ? '/admin/master/login' : '/admin/login';
      router.replace(loginUrl);
    }
  }, [router, panelType]);

  if (adminUser === null) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: '#080808' }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4"
            style={{ borderColor: 'rgba(200,151,42,0.3)', borderTopColor: '#c8972a' }}
          />
          <p style={{ color: '#a89070' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const title = panelType === 'super' ? 'Super Admin Panel' : panelType === 'master' ? 'Master Admin Panel' : 'Rental Admin Panel';

  const badgeStyle: React.CSSProperties = panelType === 'super'
    ? { background: 'rgba(200,151,42,0.12)', color: '#f0c060', border: '1px solid rgba(200,151,42,0.3)' }
    : panelType === 'master'
      ? { background: 'rgba(200,151,42,0.15)', color: '#c8972a', border: '1px solid rgba(200,151,42,0.35)' }
      : { background: 'rgba(200,151,42,0.1)', color: '#c8972a', border: '1px solid rgba(200,151,42,0.25)' };

  const logoutHref = panelType === 'super' ? '/admin/super/login' : panelType === 'master' ? '/admin/master/login' : '/admin/login';

  return (
    <div className="flex min-h-screen" style={{ background: '#080808' }}>
      <Sidebar adminUser={adminUser} panelType={panelType} />

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="px-6 py-4 flex-shrink-0"
          style={{
            background: '#0d0d0d',
            borderBottom: '1px solid rgba(200,151,42,0.2)',
          }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold" style={{ color: '#f8f4ed' }}>{title}</h1>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={badgeStyle}
              >
                {panelType === 'rental' ? <ChefHat className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {panelType === 'super' ? 'Super Admin' : panelType === 'master' ? 'Master Admin' : 'Rental Admin'}
              </div>
              <span className="text-sm font-medium" style={{ color: '#a89070' }}>{adminUser.name || 'Admin'}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('admin');
                  window.location.href = logoutHref;
                }}
                className="flex items-center gap-2 transition-colors text-sm"
                style={{ color: '#6b5040' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f8f4ed')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b5040')}
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar, { PanelType } from './Sidebar';
import { LogOut, Shield, ChefHat } from 'lucide-react';

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
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

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
      <div className="flex min-h-screen bg-slate-950 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const title = panelType === 'super' ? 'Super Admin Panel' : panelType === 'master' ? 'Master Admin Panel' : 'Rental Admin Panel';
  const headerBorder = panelType === 'super' ? 'border-purple-900/50' : panelType === 'master' ? 'border-amber-900/50' : 'border-slate-800';
  const badgeClass = panelType === 'super'
    ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
    : panelType === 'master'
      ? 'bg-amber-600/20 text-amber-300 border border-amber-600/30'
      : 'bg-orange-600/20 text-orange-300 border border-orange-600/30';
  const logoutHref = panelType === 'super' ? '/admin/super/login' : panelType === 'master' ? '/admin/master/login' : '/admin/login';

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar adminUser={adminUser} panelType={panelType} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`border-b px-6 py-4 flex-shrink-0 bg-slate-900 ${headerBorder}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                {panelType === 'rental' ? <ChefHat className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                {panelType === 'super' ? 'Super Admin' : panelType === 'master' ? 'Master Admin' : 'Rental Admin'}
              </div>
              <span className="text-slate-300 text-sm font-medium">{adminUser.name || 'Admin'}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('admin');
                  window.location.href = logoutHref;
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
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

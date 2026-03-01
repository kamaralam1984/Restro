'use client';

import { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { LogOut, Shield, ChefHat } from 'lucide-react';

interface AdminUser {
  name?: string;
  role?: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser>({});

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      try { setAdminUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const isSuperAdmin = adminUser.role === 'super_admin';

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white">
              {isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
            </h1>

            <div className="flex items-center gap-4">
              {/* Role badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isSuperAdmin
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                  : 'bg-orange-600/20 text-orange-300 border border-orange-600/30'
              }`}>
                {isSuperAdmin
                  ? <Shield className="w-3.5 h-3.5" />
                  : <ChefHat className="w-3.5 h-3.5" />}
                {isSuperAdmin ? 'Super Admin' : 'Restaurant Admin'}
              </div>

              <span className="text-slate-300 text-sm font-medium">
                {adminUser.name || 'Admin'}
              </span>

              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('admin');
                  window.location.href = '/admin/login';
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

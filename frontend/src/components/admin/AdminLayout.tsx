'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { HelpCircle, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-white">
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-white">
                <span>Admin</span>
                <span className="text-orange-600">🔥</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/admin/login';
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
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


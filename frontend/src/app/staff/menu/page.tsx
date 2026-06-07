'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isVeg: boolean;
  available: boolean;
  image?: string;
}

export default function StaffMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    api
      .get<{ items?: MenuItem[] } | MenuItem[]>('/menu', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { limit: '500' },
      })
      .then((data: any) => {
        const list = data?.items ?? (Array.isArray(data) ? data : []);
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Menu (view only)</h1>
      <div
        className="rounded-xl p-6"
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.13)',
          borderRadius: 16,
        }}
      >
        {loading ? (
          <div className="text-center py-8" style={{ color: '#a89070' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#a89070' }}>No menu items</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: '#1c1c1c',
                    borderBottom: '1px solid rgba(200,151,42,0.15)',
                  }}
                >
                  <th
                    className="text-left py-3 px-4"
                    style={{
                      color: '#a89070',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >Name</th>
                  <th
                    className="text-left py-3 px-4"
                    style={{
                      color: '#a89070',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >Category</th>
                  <th
                    className="text-left py-3 px-4"
                    style={{
                      color: '#a89070',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >Price</th>
                  <th
                    className="text-left py-3 px-4"
                    style={{
                      color: '#a89070',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >Veg</th>
                  <th
                    className="text-left py-3 px-4"
                    style={{
                      color: '#a89070',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >Available</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    style={{
                      background: '#141414',
                      borderBottom: '1px solid rgba(200,151,42,0.07)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLTableRowElement>) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = '#1c1c1c';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLTableRowElement>) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = '#141414';
                    }}
                  >
                    <td className="py-3 px-4 font-medium" style={{ color: '#f8f4ed' }}>{item.name}</td>
                    <td className="py-3 px-4 capitalize" style={{ color: '#a89070' }}>{item.category}</td>
                    <td className="py-3 px-4" style={{ color: '#f8f4ed' }}>{formatCurrency(item.price)}</td>
                    <td className="py-3 px-4" style={{ color: item.isVeg ? '#22c55e' : '#a89070' }}>{item.isVeg ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4" style={{ color: item.available ? '#22c55e' : '#ef4444' }}>{item.available ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

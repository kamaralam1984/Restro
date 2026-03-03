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
      <h1 className="text-2xl font-bold text-white">Menu (view only)</h1>
      <div className="bg-slate-900 rounded-xl p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No menu items</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Veg</th>
                  <th className="text-left py-3 px-4">Available</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-slate-300 capitalize">{item.category}</td>
                    <td className="py-3 px-4 text-white">{formatCurrency(item.price)}</td>
                    <td className="py-3 px-4">{item.isVeg ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4">{item.available ? 'Yes' : 'No'}</td>
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

'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Phone, ShoppingBag, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Customer {
  _id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Get repeat customers from analytics
      const repeatCustomers = await api.get<Customer[]>('/analytics/repeat-customers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get all unique customers from orders
      const orders = await api.get<any[]>('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const customerMap = new Map<string, Customer>();

      // Process orders to build customer data
      orders.forEach((order: any) => {
        const phone = order.customerPhone;
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            _id: phone,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: phone,
            orderCount: 0,
            totalSpent: 0,
            lastOrderDate: order.createdAt,
          });
        }
        const customer = customerMap.get(phone)!;
        customer.orderCount += 1;
        customer.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
          customer.lastOrderDate = order.createdAt;
        }
      });

      const allCustomers = Array.from(customerMap.values());
      setCustomers(allCustomers.sort((a, b) => b.totalSpent - a.totalSpent));
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerPhone.includes(searchTerm) ||
    (customer.customerEmail && customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-6" style={{ background: '#080808', minHeight: '100%' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Customers</h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>
            Total Customers: {customers.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#6b5040' }} />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              color: '#f8f4ed',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#c8972a'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)'; }}
          />
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>Loading...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>No customers found</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#1c1c1c' }}>
                  <th className="text-left py-4 px-6" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Customer</th>
                  <th className="text-left py-4 px-6" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Contact</th>
                  <th className="text-left py-4 px-6" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Orders</th>
                  <th className="text-left py-4 px-6" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Spent</th>
                  <th className="text-left py-4 px-6" style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer._id}
                    className="transition-colors"
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = '#1c1c1c'; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = '#141414'; }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                          style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808' }}
                        >
                          {customer.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#f8f4ed' }}>{customer.customerName}</p>
                          {customer.orderCount > 1 && (
                            <p className="text-xs" style={{ color: '#22c55e' }}>Repeat Customer</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {customer.customerEmail && (
                          <div className="flex items-center gap-2 text-sm" style={{ color: '#a89070' }}>
                            <Mail className="w-4 h-4" />
                            {customer.customerEmail}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#a89070' }}>
                          <Phone className="w-4 h-4" />
                          {customer.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2" style={{ color: '#f8f4ed' }}>
                        <ShoppingBag className="w-4 h-4" style={{ color: '#c8972a' }} />
                        <span className="font-semibold" style={{ color: '#f0c060', fontWeight: 900 }}>{customer.orderCount}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2" style={{ color: '#f8f4ed' }}>
                        <IndianRupee className="w-4 h-4" style={{ color: '#c8972a' }} />
                        <span className="font-semibold" style={{ color: '#f0c060', fontWeight: 900 }}>{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: '#a89070' }}>
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

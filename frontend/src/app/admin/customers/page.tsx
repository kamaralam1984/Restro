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
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">
            Total Customers: {customers.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No customers found</div>
      ) : (
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-300 font-semibold">Customer</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-semibold">Contact</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-semibold">Orders</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-semibold">Total Spent</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-semibold">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer._id}
                    className="border-b border-slate-800 hover:bg-slate-800 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{customer.customerName}</p>
                          {customer.orderCount > 1 && (
                            <p className="text-xs text-green-400">Repeat Customer</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {customer.customerEmail && (
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Mail className="w-4 h-4" />
                            {customer.customerEmail}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Phone className="w-4 h-4" />
                          {customer.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-white">
                        <ShoppingBag className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold">{customer.orderCount}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-white">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-sm">
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

'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface BillItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

type BillSource = 'online' | 'offline';

interface MenuItemForBilling {
  _id: string;
  name: string;
  price: number;
  category: string;
}

// UI-only type for offline billing rows
interface OfflineBillItem extends BillItem {
  menuItemId?: string;
}

interface Bill {
  _id: string;
  billNumber: string;
  source: BillSource;
  orderNumber?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'unpaid' | 'paid' | 'cancelled';
  createdAt: string;
}

interface OrderForBilling {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
}

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [orders, setOrders] = useState<OrderForBilling[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemForBilling[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [creatingBill, setCreatingBill] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(5); // default 5%
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [tab, setTab] = useState<'online' | 'offline'>('online');

  // Offline bill form
  const [offlineCustomerName, setOfflineCustomerName] = useState('');
  const [offlineCustomerEmail, setOfflineCustomerEmail] = useState('');
  const [offlineCustomerPhone, setOfflineCustomerPhone] = useState('');
  const [offlineItems, setOfflineItems] = useState<OfflineBillItem[]>([
    { name: '', quantity: 1, price: 0, total: 0 },
  ]);

  useEffect(() => {
    loadBills();
    loadRecentOrders();
    loadMenuItems();
  }, []);

  const loadBills = async () => {
    try {
      setLoadingBills(true);
      const data = await api.get<Bill[]>('/billing');
      setBills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load bills:', error);
    } finally {
      setLoadingBills(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await api.get<OrderForBilling[]>('/orders', {
        params: { status: 'completed' },
      });
      setOrders(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch (error) {
      console.error('Failed to load orders for billing:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      setLoadingMenu(true);
      // Fetch all menu items (including unavailable) for admin billing
      const data = await api.get<any>('/menu', {
        params: {
          available: 'all',
          limit: 200,
          sortBy: 'name',
          sortOrder: 'asc',
        },
      });

      const items = Array.isArray(data?.items) ? data.items : [];
      const mapped: MenuItemForBilling[] = items.map((item: any) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
      }));
      setMenuItems(mapped);
    } catch (error) {
      console.error('Failed to load menu items for billing:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const handleMarkAsPaid = async (billId: string, customerEmail?: string, currentMethod?: 'cash' | 'card' | 'online') => {
    if (!confirm('Mark this bill as paid? Bill receipt will be sent to customer email if provided.')) {
      return;
    }

    // If no email, ask for it
    let emailToUse = customerEmail;
    if (!emailToUse) {
      const email = prompt('Enter customer email to send bill receipt:');
      if (!email) {
        alert('Email is required to send bill receipt');
        return;
      }
      emailToUse = email;
    }

    try {
      await api.put(`/billing/${billId}/status`, {
        status: 'paid',
        paymentMethod: currentMethod || 'cash',
        customerEmail: emailToUse,
      });
      toast.success('Bill marked as paid. Email sent to customer.');
      loadBills();
    } catch (error: any) {
      console.error('Failed to mark bill as paid:', error);
      toast.error(error?.message || 'Failed to mark bill as paid');
    }
  };

  const handleCreateOnlineBill = async () => {
    if (!selectedOrderId) {
      alert('Please select an order to generate bill');
      return;
    }

    try {
      setCreatingBill(true);
      const bill = await api.post<Bill>('/billing/from-order', {
        orderId: selectedOrderId,
        taxRate,
        discountAmount,
        paymentMethod,
      });
      setBills((prev) => [bill, ...prev]);
      alert('Online bill generated successfully');
    } catch (error: any) {
      console.error('Failed to create online bill:', error);
      alert(error?.message || 'Failed to create bill');
    } finally {
      setCreatingBill(false);
    }
  };

  const updateOfflineItem = (
    index: number,
    field: keyof OfflineBillItem,
    value: string | number
  ) => {
    setOfflineItems((prev) => {
      const items = [...prev];
      const item = { ...items[index] };
      if (field === 'menuItemId') {
        const id = String(value);
        item.menuItemId = id;
        const menuItem = menuItems.find((m) => m._id === id);
        if (menuItem) {
          item.name = menuItem.name;
          item.price = menuItem.price;
        }
      } else if (field === 'quantity' || field === 'price') {
        const num = Number(value) || 0;
        (item as any)[field] = num;
      } else {
        (item as any)[field] = value;
      }
      item.total = (item.quantity || 0) * (item.price || 0);
      items[index] = item;
      return items;
    });
  };

  const addOfflineItemRow = () => {
    setOfflineItems((prev) => [...prev, { name: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeOfflineItemRow = (index: number) => {
    setOfflineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const offlineSubtotal = offlineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const offlineTax = Math.round((offlineSubtotal * taxRate) / 100);
  const offlineGrandTotal = offlineSubtotal + offlineTax - discountAmount;

  const handleCreateOfflineBill = async () => {
    if (!offlineCustomerName) {
      alert('Please enter customer name');
      return;
    }
    if (!offlineItems.some((i) => i.name && i.quantity > 0 && i.price > 0)) {
      alert('Please add at least one item with name, quantity and price');
      return;
    }

    try {
      setCreatingBill(true);
      const payload = {
        customerName: offlineCustomerName,
        customerEmail: offlineCustomerEmail || undefined,
        customerPhone: offlineCustomerPhone,
        items: offlineItems.filter((i) => i.name && i.quantity > 0 && i.price > 0),
        taxRate,
        discountAmount,
        paymentMethod,
      };
      const bill = await api.post<Bill>('/billing/offline', payload);
      setBills((prev) => [bill, ...prev]);
      alert('Offline bill generated successfully');
      // Reset form
      setOfflineCustomerName('');
      setOfflineCustomerEmail('');
      setOfflineCustomerPhone('');
      setOfflineItems([{ name: '', quantity: 1, price: 0, total: 0 }]);
    } catch (error: any) {
      console.error('Failed to create offline bill:', error);
      alert(error?.message || 'Failed to create offline bill');
    } finally {
      setCreatingBill(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Billing Panel</h1>
      </div>

      {/* Tabs for Online / Offline billing */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('online')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === 'online' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          Online Orders
        </button>
        <button
          type="button"
          onClick={() => setTab('offline')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === 'offline' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          Offline / Walk-in
        </button>
      </div>

      {/* Create Bill Section */}
      <div className="bg-slate-900 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {tab === 'online' ? 'Generate Bill from Online Order' : 'Generate Offline Bill'}
        </h2>
        <p className="text-sm text-slate-400">
          Billing control sirf admin / shopper ke paas hai. Customer yahan access nahi kar sakta.
        </p>

        {tab === 'online' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-2">Select Completed Order</label>
                {loadingOrders ? (
                  <div className="text-slate-400 text-sm py-2">Loading orders...</div>
                ) : (
                  <select
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                  >
                    <option value="">Select order...</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        #{order.orderNumber} - {order.customerName} ({formatCurrency(order.total)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Tax (%)</label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseInt(e.target.value || '0', 10))}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Offline customer & items form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Customer Name *</label>
                <input
                  type="text"
                  value={offlineCustomerName}
                  onChange={(e) => setOfflineCustomerName(e.target.value)}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
                  placeholder="Walk-in customer"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Email (for bill receipt)</label>
                <input
                  type="email"
                  value={offlineCustomerEmail}
                  onChange={(e) => setOfflineCustomerEmail(e.target.value)}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Phone</label>
                <input
                  type="text"
                  value={offlineCustomerPhone}
                  onChange={(e) => setOfflineCustomerPhone(e.target.value)}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Tax (%)</label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseInt(e.target.value || '0', 10))}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">Items</h3>
                <button
                  type="button"
                  onClick={addOfflineItemRow}
                  className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2">
                {offlineItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-800/60 p-2 rounded"
                  >
                    <div className="col-span-5 space-y-1">
                      {loadingMenu ? (
                        <div className="text-xs text-slate-400 px-2 py-1">Loading items...</div>
                      ) : (
                        <select
                          className="w-full bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                          value={item.menuItemId || ''}
                          onChange={(e) =>
                            updateOfflineItem(index, 'menuItemId', e.target.value)
                          }
                        >
                          <option value="">Select item...</option>
                          {menuItems.map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name} ({formatCurrency(m.price)})
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="text-[10px] text-slate-400 px-1 truncate">
                        {item.name || 'No item selected'}
                      </div>
                    </div>
                    <input
                      type="number"
                      min={1}
                      className="col-span-2 bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateOfflineItem(index, 'quantity', e.target.value)}
                    />
                    <input
                      type="number"
                      min={0}
                      className="col-span-2 bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateOfflineItem(index, 'price', e.target.value)}
                    />
                    <div className="col-span-2 text-right text-slate-100 text-xs">
                      {item.total > 0 && formatCurrency(item.total)}
                    </div>
                    <button
                      type="button"
                      className="col-span-1 text-red-400 text-xs"
                      onClick={() => removeOfflineItemRow(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Discount (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseInt(e.target.value || '0', 10))}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-700"
                />
              </div>
              <div className="md:col-span-2 text-right text-sm text-slate-200 space-y-1">
                <div>Subtotal: {formatCurrency(offlineSubtotal)}</div>
                <div>Tax: {formatCurrency(offlineTax)}</div>
                <div className="font-semibold">
                  Grand Total: {formatCurrency(Math.max(offlineGrandTotal, 0))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">Payment Method:</span>
            {(['cash', 'card', 'online'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  paymentMethod === method
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {method.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={creatingBill}
            onClick={tab === 'online' ? handleCreateOnlineBill : handleCreateOfflineBill}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
          >
            {creatingBill ? 'Generating...' : 'Generate Bill'}
          </button>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Bills</h2>

        {loadingBills ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No bills generated yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4">Bill No</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill._id} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="py-3 px-4 text-white font-mono">{bill.billNumber}</td>
                    <td className="py-3 px-4 text-slate-300 capitalize">{bill.source}</td>
                    <td className="py-3 px-4 text-slate-300">{bill.orderNumber || '-'}</td>
                    <td className="py-3 px-4 text-slate-200">{bill.customerName}</td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {formatCurrency(bill.grandTotal)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bill.status === 'paid'
                            ? 'bg-green-600 text-white'
                            : bill.status === 'cancelled'
                            ? 'bg-red-600 text-white'
                            : 'bg-yellow-600 text-white'
                        }`}
                      >
                        {bill.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(bill.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {bill.status === 'unpaid' && (
                        <button
                          onClick={() => handleMarkAsPaid(bill._id, bill.customerEmail, bill.paymentMethod)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
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



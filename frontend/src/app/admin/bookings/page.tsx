'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Booking {
  _id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  tableNumber?: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [tablesCount, setTablesCount] = useState<number | null>(null);
  const [initializingTables, setInitializingTables] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    loadBookings();
  }, [statusFilter, selectedDate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const admin = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    let slug: string | undefined;
    try { if (admin) slug = JSON.parse(admin).restaurantSlug; } catch {}
    const params = slug ? { restaurant: slug } : {};
    api.get<any[]>('/tables', { params, headers: { Authorization: `Bearer ${token}` } })
      .then((data) => setTablesCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setTablesCount(0));
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view bookings');
        window.location.href = '/admin/login';
        return;
      }

      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (selectedDate) params.date = selectedDate;

      const data = await api.get<Booking[]>('/bookings', {
        params,
      });
      setBookings(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      const errorMessage = error?.message || 'Failed to load bookings';
      
      // If token is invalid, the interceptor will handle redirect
      if (errorMessage.includes('token') || errorMessage.includes('expired') || errorMessage.includes('Session')) {
        toast.error('Session expired. Please login again.');
        // Interceptor will redirect, but we can also do it here
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1000);
      } else {
        toast.error(errorMessage);
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: string, tableNumber?: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/bookings/${id}/status`,
        { status, tableNumber },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Booking status updated');
      loadBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-600',
      confirmed: 'bg-green-600',
      cancelled: 'bg-red-600',
      completed: 'bg-blue-600',
    };
    return colors[status] || 'bg-gray-600';
  };

  const handleInitializeTables = async () => {
    setInitializingTables(true);
    try {
      const token = localStorage.getItem('token');
      const admin = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
      let slug: string | undefined;
      try { if (admin) slug = JSON.parse(admin).restaurantSlug; } catch {}

      await api.post(
        '/tables/initialize',
        slug ? { restaurant: slug } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('20 tables created for your restaurant. Customers can now select tables when booking.');
      setTablesCount(20);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to initialize tables');
    } finally {
      setInitializingTables(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
      </div>

      {/* Initialize tables banner */}
      {tablesCount !== null && tablesCount === 0 && (
        <div className="bg-amber-900/30 border border-amber-600/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-amber-200 font-medium">Tables not set up</p>
            <p className="text-amber-200/80 text-sm mt-1">Customers will see &quot;No tables found&quot; when booking. Create tables for your restaurant once.</p>
          </div>
          <button
            type="button"
            onClick={handleInitializeTables}
            disabled={initializingTables}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {initializingTables ? 'Creating...' : 'Create 20 tables'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No bookings found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking._id}
              className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-orange-600 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {booking.customerName}
                  </h3>
                  <p className="text-sm text-slate-400">#{booking.bookingNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)} text-white`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span>{booking.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4" />
                  <span>{booking.numberOfGuests} Guests</span>
                </div>
                {booking.tableNumber && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-xs">Table: {booking.tableNumber}</span>
                  </div>
                )}
                <div className="text-sm text-slate-400">
                  <p>{booking.customerEmail}</p>
                  <p>{booking.customerPhone}</p>
                </div>
                {booking.specialRequests && (
                  <div className="mt-2 p-2 bg-slate-800 rounded text-sm text-slate-300">
                    <strong>Special Requests:</strong> {booking.specialRequests}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        const tableNumber = prompt('Enter table number:');
                        if (tableNumber) {
                          updateBookingStatus(booking._id, 'confirmed', tableNumber);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'completed')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

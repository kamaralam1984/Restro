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

  const getStatusStyle = (status: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      pending: { background: 'rgba(240,192,96,0.12)', color: '#f0c060', border: '1px solid rgba(240,192,96,0.35)', borderRadius: '999px', padding: '2px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
      confirmed: { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '999px', padding: '2px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
      cancelled: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '999px', padding: '2px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
      completed: { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.35)', borderRadius: '999px', padding: '2px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
    };
    return styles[status] || { background: 'rgba(168,144,112,0.1)', color: '#a89070', border: '1px solid rgba(168,144,112,0.3)', borderRadius: '999px', padding: '2px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' };
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
    <div
      className="space-y-6"
      style={{ background: '#080808', minHeight: '100%' }}
    >
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#f8f4ed', letterSpacing: '0.01em' }}
        >
          Bookings
        </h1>
      </div>

      {/* Initialize tables banner */}
      {tablesCount !== null && tablesCount === 0 && (
        <div
          className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
          style={{
            background: 'rgba(200,151,42,0.08)',
            border: '1px solid rgba(200,151,42,0.35)',
          }}
        >
          <div>
            <p className="font-medium" style={{ color: '#f0c060' }}>Tables not set up</p>
            <p className="text-sm mt-1" style={{ color: '#a89070' }}>
              Customers will see &quot;No tables found&quot; when booking. Create tables for your restaurant once.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInitializeTables}
            disabled={initializingTables}
            style={{
              background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
              color: '#080808',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 14,
              cursor: initializingTables ? 'not-allowed' : 'pointer',
              opacity: initializingTables ? 0.6 : 1,
            }}
          >
            {initializingTables ? 'Creating...' : 'Create 20 tables'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div
        className="rounded-xl p-4 space-y-4"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: '#6b5040' }}
              />
              <input
                type="text"
                placeholder="Search bookings..."
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
                onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              color: '#f8f4ed',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
          >
            <option value="all" style={{ background: '#1c1c1c', color: '#f8f4ed' }}>All Status</option>
            <option value="pending" style={{ background: '#1c1c1c', color: '#f0c060' }}>Pending</option>
            <option value="confirmed" style={{ background: '#1c1c1c', color: '#22c55e' }}>Confirmed</option>
            <option value="cancelled" style={{ background: '#1c1c1c', color: '#ef4444' }}>Cancelled</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2"
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              color: '#f8f4ed',
              outline: 'none',
              colorScheme: 'dark',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>Loading...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>No bookings found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking._id}
              className="rounded-xl p-6 transition-colors"
              style={{
                background: '#141414',
                border: '1px solid rgba(200,151,42,0.13)',
                borderRadius: '16px',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) =>
                (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.35)')
              }
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) =>
                (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.13)')
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ color: '#f8f4ed' }}
                  >
                    {booking.customerName}
                  </h3>
                  <p className="text-sm" style={{ color: '#a89070' }}>
                    #{booking.bookingNumber}
                  </p>
                </div>
                <span style={getStatusStyle(booking.status)}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2" style={{ color: '#a89070' }}>
                  <Calendar className="w-4 h-4" style={{ color: '#c8972a' }} />
                  <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: '#a89070' }}>
                  <Clock className="w-4 h-4" style={{ color: '#c8972a' }} />
                  <span>{booking.time}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: '#a89070' }}>
                  <Users className="w-4 h-4" style={{ color: '#c8972a' }} />
                  <span>{booking.numberOfGuests} Guests</span>
                </div>
                {booking.tableNumber && (
                  <div className="flex items-center gap-2" style={{ color: '#a89070' }}>
                    <span
                      className="text-xs"
                      style={{
                        background: 'rgba(200,151,42,0.1)',
                        border: '1px solid rgba(200,151,42,0.25)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        color: '#c8972a',
                        fontWeight: 600,
                      }}
                    >
                      Table: {booking.tableNumber}
                    </span>
                  </div>
                )}
                <div className="text-sm" style={{ color: '#a89070' }}>
                  <p>{booking.customerEmail}</p>
                  <p>{booking.customerPhone}</p>
                </div>
                {booking.specialRequests && (
                  <div
                    className="mt-2 p-2 rounded text-sm"
                    style={{ background: '#1c1c1c', color: '#a89070', borderLeft: '2px solid rgba(200,151,42,0.4)' }}
                  >
                    <strong style={{ color: '#c8972a' }}>Special Requests:</strong>{' '}
                    {booking.specialRequests}
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
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded"
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#22c55e',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(34,197,94,0.18)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(34,197,94,0.1)')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'completed')}
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'rgba(96,165,250,0.1)',
                      border: '1px solid rgba(96,165,250,0.3)',
                      color: '#60a5fa',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(96,165,250,0.18)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(96,165,250,0.1)')}
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

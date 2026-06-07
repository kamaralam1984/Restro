'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { orderService } from '@/services/order.service';
import TableLayout from '@/components/TableLayout';
import { loadRazorpayScript } from '@/utils/razorpay';
import {
  getBookingConfig,
  validateAdvanceBooking,
  getMinBookingDate,
  getMinBookingTime,
  BOOKING_TIME_SLOTS,
  calculateEndTime,
  validateTimeSlot
} from '@/utils/booking.utils';
import api from '@/services/api';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import { CreditCard, Info, AlertCircle, CheckCircle } from 'lucide-react';
import ServiceSuspendedMessage from '@/components/ServiceSuspendedMessage';

interface Table {
  tableNumber: string;
  capacity: number;
  hourlyRate?: number;
  discountThreshold?: number;
  discountAmount?: number;
}

// ─── Luxury Black+Gold Design Tokens ───────────────────────────────────────────
const BG        = '#080808';
const CARD      = '#141414';
const INPUT_BG  = '#1c1c1c';
const GOLD      = '#c8972a';
const GOLD_LIGHT = '#f0c060';
const TEXT      = '#f8f4ed';
const MUTED     = '#a89070';
const BORDER    = 'rgba(200,151,42,0.15)';
const BORDER_MID = 'rgba(200,151,42,0.30)';
const BORDER_STRONG = 'rgba(200,151,42,0.55)';

const inputStyle: React.CSSProperties = {
  background: INPUT_BG,
  color: TEXT,
  border: `1px solid ${BORDER_MID}`,
  borderRadius: '0.5rem',
  padding: '0.5rem 1rem',
  width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: '0.5rem',
  color: GOLD_LIGHT,
};

function BookingPageContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRestaurant } = useRestaurantPage();
  const restaurantSlug = searchParams.get('restaurant') || process.env.NEXT_PUBLIC_RESTAURANT_SLUG || 'spice-garden';
  const [restaurantSuspended, setRestaurantSuspended] = useState<boolean | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedTableInfo, setSelectedTableInfo] = useState<Table | null>(null);
  const [bookingConfig, setBookingConfig] = useState<any>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string>('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    bookingHours: 1,
    numberOfGuests: parseInt(searchParams.get('guests') || '2', 10),
    specialRequests: '',
  });
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [totalBookingAmount, setTotalBookingAmount] = useState<number>(0);
  const [dateDisplay, setDateDisplay] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('cash');

  // Format date from ISO (YYYY-MM-DD) to DD/MM/YYYY for display
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY to ISO format (YYYY-MM-DD)
  const parseDateFromDisplay = (displayDate: string): string => {
    if (!displayDate) return '';
    const cleaned = displayDate.replace(/[^\d/]/g, '');
    const parts = cleaned.split('/').filter(p => p);

    if (parts.length === 3) {
      let [day, month, year] = parts;
      day = day.padStart(2, '0');
      month = month.padStart(2, '0');
      if (day.length <= 2 && month.length <= 2 && year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    }
    return '';
  };

  // Handle date input change with DD/MM/YYYY format
  const handleDateChange = (value: string) => {
    const cleaned = value.replace(/[^\d/]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 2 && !cleaned.includes('/')) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (formatted.length > 5 && formatted.split('/').length === 2) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }
    setDateDisplay(formatted);
    const isoDate = parseDateFromDisplay(formatted);
    if (isoDate) {
      setFormData({ ...formData, date: isoDate });
    } else if (formatted.length === 0) {
      setFormData({ ...formData, date: '' });
    }
  };

  // Update date display when formData.date changes (from date picker)
  useEffect(() => {
    if (formData.date && !dateDisplay) {
      setDateDisplay(formatDateForDisplay(formData.date));
    }
  }, [formData.date]);

  useEffect(() => {
    setRazorpayKey(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '');
  }, []);

  useEffect(() => {
    if (!restaurantSlug) {
      setRestaurantSuspended(null);
      setRestaurant(null);
      return;
    }
    api
      .get<{ status?: string; subscriptionStatus?: string; name?: string; logo?: string; primaryColor?: string }>(`/restaurants/by-slug/${restaurantSlug}`)
      .then((r) => {
        const suspended =
          r.status === 'inactive' ||
          r.subscriptionStatus === 'suspended' ||
          r.subscriptionStatus === 'cancelled';
        setRestaurantSuspended(suspended);
        setRestaurantName(r.name || '');
        setRestaurant({ slug: restaurantSlug, name: r.name || restaurantSlug, logo: r.logo, primaryColor: r.primaryColor });
      })
      .catch(() => {
        setRestaurantSuspended(false);
        setRestaurant(null);
      });
  }, [restaurantSlug, setRestaurant]);

  useEffect(() => {
    if (selectedTable && selectedTableInfo) {
      const config = getBookingConfig(selectedTableInfo.capacity, selectedTableInfo);
      setBookingConfig(config);
      setTotalBookingAmount(config.hourlyRate * formData.bookingHours);
    } else {
      setBookingConfig(null);
      setTotalBookingAmount(0);
    }
  }, [selectedTable, selectedTableInfo, formData.bookingHours]);

  useEffect(() => {
    if (formData.date && formData.time) {
      const validation = validateAdvanceBooking(formData.date, formData.time);
      if (!validation.valid) {
        setValidationError(validation.error || '');
      } else {
        const timeSlotValidation = validateTimeSlot(formData.time);
        if (!timeSlotValidation.valid) {
          setValidationError(timeSlotValidation.error || '');
        } else {
          const endTime = calculateEndTime(formData.time, formData.bookingHours);
          const endTimeValidation = validateTimeSlot(endTime);
          if (!endTimeValidation.valid) {
            setValidationError(`Booking end time (${endTime}) exceeds allowed booking hours. Maximum booking time is ${BOOKING_TIME_SLOTS.endTime}`);
          } else {
            setValidationError('');
          }
        }
      }
    }
  }, [formData.date, formData.time, formData.bookingHours]);

  const handleTableSelect = (table: { tableNumber: string; capacity: number; hourlyRate?: number; discountThreshold?: number; discountAmount?: number }) => {
    setSelectedTable(table.tableNumber);
    setSelectedTableInfo({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      hourlyRate: table.hourlyRate,
      discountThreshold: table.discountThreshold,
      discountAmount: table.discountAmount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.date && formData.time) {
      const validation = validateAdvanceBooking(formData.date, formData.time);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
    }

    if (!selectedTable) {
      alert('Please select a table');
      return;
    }

    setLoading(true);

    try {
      const booking = await orderService.createBooking({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        date: formData.date,
        time: formData.time,
        bookingHours: formData.bookingHours,
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests,
        tableNumber: selectedTable,
        ...(restaurantSlug && { restaurantSlug }),
      });

      const bId = booking.id || (booking as any)._id;
      setBookingId(bId);

      if (paymentMethod === 'cash') {
        setSuccess(true);
        setTimeout(() => router.push('/'), 5000);
        setLoading(false);
        return;
      }

      await handlePayment(bId);
    } catch (error: any) {
      console.error('Booking failed:', error);
      const errorMessage = error?.message || error?.response?.data?.error || 'Failed to create booking. Please try again.';
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handlePayment = async (bookingId: string) => {
    try {
      setProcessingPayment(true);
      await loadRazorpayScript();

      const paymentOrder = await api.post('/bookings/payment/create', {
        bookingId,
      }) as { amount: number; currency: string; orderId: string };

      if (!razorpayKey) {
        throw new Error('Payment gateway not configured');
      }

      const options = {
        key: razorpayKey,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Restro OS Restaurant',
        description: `Table Booking Payment - ₹${totalBookingAmount || 0} (${formData.bookingHours} hour${formData.bookingHours > 1 ? 's' : ''})`,
        order_id: paymentOrder.orderId,
        handler: async (response: any) => {
          try {
            await api.post('/bookings/payment/verify', {
              bookingId,
              razorpayOrderId: paymentOrder.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            setSuccess(true);
            setTimeout(() => {
              router.push('/');
            }, 5000);
          } catch (error: any) {
            console.error('Payment verification failed:', error);
            const errorMessage = error?.response?.data?.error || error?.message || 'Payment verification failed. Please contact support.';
            alert(errorMessage);
            setProcessingPayment(false);
            setLoading(false);
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        theme: {
          color: GOLD,
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment failed:', error);
      const errorMessage = error?.message || error?.response?.data?.error || 'Payment failed. Please try again.';
      alert(errorMessage);
      setProcessingPayment(false);
      setLoading(false);
    }
  };

  if (restaurantSlug && restaurantSuspended === true) {
    return (
      <div className="min-h-screen" style={{ background: BG }}>
        <ServiceSuspendedMessage restaurantName={restaurantName} subscriptionExpired />
      </div>
    );
  }

  if (success) {
    return (
      <div
        className="min-h-[70vh] flex items-center justify-center"
        style={{ background: BG }}
      >
        <div className="container mx-auto px-4 py-8 text-center max-w-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              background: CARD,
              border: '1px solid rgba(34,197,94,0.35)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 0 40px rgba(34,197,94,0.15), 0 0 80px rgba(0,0,0,0.6)',
            }}
          >
            <CheckCircle
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: '#22c55e', filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.6))' }}
            />
            <h2
              className="text-2xl font-bold mb-2"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Booking Confirmed!
            </h2>
            <p className="mb-2" style={{ color: TEXT }}>Your advance payment has been received.</p>
            <p className="text-sm" style={{ color: MUTED }}>
              Booking Number: {bookingId ? `BK-${bookingId.slice(-6)}` : 'N/A'}
            </p>
            <p className="text-sm mt-2" style={{ color: MUTED }}>
              We&apos;ll send you a confirmation email shortly.
            </p>
            <p className="text-xs mt-4" style={{ color: `${GOLD}cc` }}>
              Note: Payment is non-refundable. If your order reaches ₹{bookingConfig?.discountThreshold || 0},
              you&apos;ll get ₹{bookingConfig?.discountAmount || 0} discount!
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const minDate = getMinBookingDate();
  const minTime = formData.date ? getMinBookingTime(formData.date) : '00:00';

  const isDisabled = loading || processingPayment || !selectedTable || !!validationError;

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center py-10"
      style={{ background: `linear-gradient(to bottom, ${BG}, #0e0e0e, ${BG})` }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h1
          className="text-3xl font-bold mb-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t('bookTable')}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              style={{
                background: CARD,
                border: `1px solid ${BORDER_MID}`,
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Validation Error */}
              {validationError && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-lg"
                  style={{
                    background: 'rgba(180,30,30,0.18)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    color: '#fca5a5',
                  }}
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{validationError}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Your full name"
                  style={{
                    ...inputStyle,
                    border: `1px solid ${focusedField === 'name' ? GOLD : BORDER_MID}`,
                    boxShadow: focusedField === 'name' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="your@email.com"
                  style={{
                    ...inputStyle,
                    border: `1px solid ${focusedField === 'email' ? GOLD : BORDER_MID}`,
                    boxShadow: focusedField === 'email' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  placeholder="+91 XXXXX XXXXX"
                  style={{
                    ...inputStyle,
                    border: `1px solid ${focusedField === 'phone' ? GOLD : BORDER_MID}`,
                    boxShadow: focusedField === 'phone' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                  }}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>
                    {t('selectDate')} * (DD/MM/YYYY)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="DD/MM/YYYY"
                      value={dateDisplay}
                      onChange={(e) => handleDateChange(e.target.value)}
                      onFocus={() => setFocusedField('date')}
                      onBlur={() => setFocusedField('')}
                      maxLength={10}
                      style={{
                        ...inputStyle,
                        width: '90%',
                        border: `1px solid ${focusedField === 'date' ? GOLD : BORDER_MID}`,
                        boxShadow: focusedField === 'date' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                      }}
                    />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        setDateDisplay(formatDateForDisplay(e.target.value));
                      }}
                      min={minDate}
                      style={{
                        width: '3rem',
                        padding: '0.5rem',
                        background: INPUT_BG,
                        border: `1px solid ${BORDER_MID}`,
                        borderRadius: '0.5rem',
                        color: TEXT,
                        cursor: 'pointer',
                        colorScheme: 'dark',
                      } as React.CSSProperties}
                      title="Click to select date"
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: `${GOLD}99` }}>
                    You need to book at least 2 hours in advance. For same-day bookings within 2 hours, please call us.
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>
                    {t('selectTime')} *
                  </label>
                  <input
                    type="time"
                    required
                    min={minTime}
                    max={BOOKING_TIME_SLOTS.endTime}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    onFocus={() => setFocusedField('time')}
                    onBlur={() => setFocusedField('')}
                    style={{
                      ...inputStyle,
                      border: `1px solid ${focusedField === 'time' ? GOLD : BORDER_MID}`,
                      boxShadow: focusedField === 'time' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                      colorScheme: 'dark',
                    } as React.CSSProperties}
                  />
                  <p className="text-xs mt-1" style={{ color: `${GOLD}99` }}>
                    Available: {BOOKING_TIME_SLOTS.startTime} - {BOOKING_TIME_SLOTS.endTime}
                  </p>
                </div>
              </div>

              {/* Booking Hours */}
              <div>
                <label style={labelStyle}>Booking Hours *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={formData.bookingHours}
                  onChange={(e) => {
                    const hours = parseInt(e.target.value) || 1;
                    setFormData({ ...formData, bookingHours: hours });
                  }}
                  onFocus={() => setFocusedField('hours')}
                  onBlur={() => setFocusedField('')}
                  style={{
                    ...inputStyle,
                    border: `1px solid ${focusedField === 'hours' ? GOLD : BORDER_MID}`,
                    boxShadow: focusedField === 'hours' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                  }}
                />
                {formData.time && (
                  <p className="text-xs mt-1" style={{ color: `${GOLD}99` }}>
                    End Time: {calculateEndTime(formData.time, formData.bookingHours)}
                  </p>
                )}
              </div>

              {/* Number of Guests */}
              <div>
                <label style={labelStyle}>{t('numberOfGuests')} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                  onFocus={() => setFocusedField('guests')}
                  onBlur={() => setFocusedField('')}
                  style={{
                    ...inputStyle,
                    border: `1px solid ${focusedField === 'guests' ? GOLD : BORDER_MID}`,
                    boxShadow: focusedField === 'guests' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                  }}
                />
              </div>

              {/* Special Requests */}
              <div>
                <label style={labelStyle}>{t('specialRequests')}</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  onFocus={() => setFocusedField('requests')}
                  onBlur={() => setFocusedField('')}
                  rows={3}
                  placeholder="Any special requests or dietary requirements..."
                  style={{
                    ...inputStyle,
                    border: `1px solid ${focusedField === 'requests' ? GOLD : BORDER_MID}`,
                    boxShadow: focusedField === 'requests' ? `0 0 0 2px ${BORDER_STRONG}` : 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Table Selection */}
              {formData.date && formData.time ? (
                <div
                  className="mt-6"
                  style={{
                    background: '#0f0f0f',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: `1px solid ${BORDER_MID}`,
                  }}
                >
                  <h3 className="text-xl font-semibold mb-2" style={{ color: GOLD_LIGHT }}>
                    Select Your Table
                  </h3>
                  <p className="text-sm mb-4" style={{ color: MUTED }}>
                    Choose a table from the layout below. Available tables can be selected.
                  </p>
                  <TableLayout
                    selectedDate={formData.date}
                    selectedTime={formData.time}
                    numberOfGuests={formData.numberOfGuests}
                    onTableSelect={handleTableSelect}
                    selectedTable={selectedTable}
                    restaurantSlug={restaurantSlug || undefined}
                  />
                </div>
              ) : (
                <div
                  className="mt-6 p-4 rounded-lg flex items-center gap-2"
                  style={{
                    background: 'rgba(200,151,42,0.06)',
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <Info className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                  <p className="text-sm" style={{ color: MUTED }}>
                    Please select a date and time to view available tables.
                  </p>
                </div>
              )}

              {/* Payment Method */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={labelStyle}>Payment Method *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'cash' as const, label: 'Pay at Restaurant', icon: '🏠', desc: 'Pay when you arrive' },
                    { key: 'online' as const, label: 'Online Payment', icon: '💳', desc: 'Razorpay (secured)' },
                  ].map(opt => {
                    const active = paymentMethod === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setPaymentMethod(opt.key)}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          border: `1.5px solid ${active ? GOLD : BORDER_MID}`,
                          background: active ? 'rgba(200,151,42,0.12)' : INPUT_BG,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.18s',
                          outline: 'none',
                          boxShadow: active ? `0 0 0 1px ${GOLD}44` : 'none',
                        }}
                      >
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{opt.icon}</div>
                        <div style={{ color: active ? GOLD_LIGHT : TEXT, fontWeight: 700, fontSize: 13 }}>{opt.label}</div>
                        <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isDisabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  background: isDisabled
                    ? 'rgba(200,151,42,0.25)'
                    : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})`,
                  color: isDisabled ? MUTED : '#080808',
                  boxShadow: isDisabled ? 'none' : `0 4px 20px rgba(200,151,42,0.35)`,
                  transition: 'all 0.2s',
                  letterSpacing: '0.04em',
                }}
                whileHover={!isDisabled ? { scale: 1.02, boxShadow: `0 6px 28px rgba(200,151,42,0.5)` } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
              >
                {processingPayment ? 'Processing Payment...' : loading ? 'Creating Booking...' : paymentMethod === 'cash' ? 'Confirm Booking →' : 'Proceed to Payment →'}
              </motion.button>
            </form>
          </div>

          {/* Payment Info Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-4"
              style={{
                background: CARD,
                border: `1px solid ${BORDER_MID}`,
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              }}
            >
              <h3
                className="text-xl font-bold mb-4 flex items-center gap-2"
                style={{ color: GOLD_LIGHT }}
              >
                <CreditCard className="w-6 h-6" style={{ color: GOLD }} />
                Booking Details
              </h3>

              <div className="space-y-4">
                {selectedTable && bookingConfig ? (
                  <>
                    {/* Selected Table */}
                    <div
                      style={{
                        background: 'rgba(200,151,42,0.07)',
                        border: `1px solid ${BORDER_MID}`,
                        borderRadius: '0.5rem',
                        padding: '1rem',
                      }}
                    >
                      <p className="text-sm mb-1" style={{ color: MUTED }}>Selected Table</p>
                      <p className="text-lg font-bold" style={{ color: GOLD_LIGHT }}>{selectedTable}</p>
                      <p className="text-xs mt-1" style={{ color: MUTED }}>Capacity: {selectedTableInfo?.capacity} persons</p>
                    </div>

                    {/* Hourly Rate */}
                    <div
                      style={{
                        background: 'rgba(200,151,42,0.10)',
                        border: `1px solid ${BORDER_MID}`,
                        borderRadius: '0.5rem',
                        padding: '1rem',
                      }}
                    >
                      <p className="text-sm mb-1" style={{ color: MUTED }}>Hourly Rate</p>
                      <p className="text-lg font-bold" style={{ color: GOLD_LIGHT }}>₹{bookingConfig.hourlyRate}/hour</p>
                      <p className="text-xs mt-1" style={{ color: MUTED }}>
                        {formData.bookingHours} hour{formData.bookingHours > 1 ? 's' : ''} × ₹{bookingConfig.hourlyRate}
                      </p>
                    </div>

                    {/* Total Amount */}
                    <div
                      style={{
                        background: 'rgba(200,151,42,0.13)',
                        border: `1px solid ${BORDER_STRONG}`,
                        borderRadius: '0.5rem',
                        padding: '1rem',
                      }}
                    >
                      <p className="text-sm mb-1" style={{ color: MUTED }}>Total Booking Amount</p>
                      <p
                        className="text-2xl font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        ₹{totalBookingAmount}
                      </p>
                      <p className="text-xs mt-1" style={{ color: MUTED }}>
                        Payment required to confirm booking
                      </p>
                      <p className="text-xs mt-2 flex items-center gap-1" style={{ color: `${GOLD}99` }}>
                        <Info className="w-3 h-3 inline" />
                        Non-refundable
                      </p>
                    </div>

                    {/* Discount Offer */}
                    <div
                      style={{
                        background: 'rgba(34,197,94,0.07)',
                        border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                      }}
                    >
                      <p className="text-sm mb-1" style={{ color: '#86efac' }}>Discount Offer</p>
                      <p className="text-lg font-bold" style={{ color: '#4ade80' }}>
                        Get ₹{bookingConfig.discountAmount} OFF
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#86efac' }}>
                        When order reaches ₹{bookingConfig.discountThreshold}
                      </p>
                      <p className="text-sm mt-2 font-medium" style={{ color: '#bbf7d0' }}>
                        Order ₹{bookingConfig.discountThreshold} or more to get ₹{bookingConfig.discountAmount} discount.
                      </p>
                      <p className="text-xs mt-2 font-semibold" style={{ color: '#4ade80' }}>
                        Important: Only 1 hour discount applies. When you place an order of ₹{bookingConfig.discountThreshold} or more, you will get ₹{bookingConfig.discountAmount} discount on your order.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8" style={{ color: `${GOLD}55` }}>
                    <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm" style={{ color: MUTED }}>Select a table to see amount and discount details</p>
                  </div>
                )}

                {/* Booking Rules */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: MUTED }}>Booking Rules</p>
                  <ul className="text-xs space-y-1 leading-relaxed" style={{ color: MUTED }}>
                    <li>• Please book at least <span style={{ color: TEXT, fontWeight: 600 }}>2 hours in advance</span>.</li>
                    <li>• Booking hours: <span style={{ color: TEXT, fontWeight: 600 }}>{BOOKING_TIME_SLOTS.startTime} – {BOOKING_TIME_SLOTS.endTime}</span>.</li>
                    <li>• Your table is reserved for <span style={{ color: TEXT, fontWeight: 600 }}>{formData.bookingHours} hour{formData.bookingHours > 1 ? 's' : ''}</span>. Extra time depends on table availability.</li>
                    <li>• Please arrive within <span style={{ color: TEXT, fontWeight: 600 }}>15 minutes</span> of your booking time. After that, the table may be released for other guests.</li>
                    <li>• For groups larger than <span style={{ color: TEXT, fontWeight: 600 }}>10 guests</span>, please call the restaurant to confirm your booking.</li>
                    <li>• Online advance payment is required to confirm the booking and is generally <span style={{ color: TEXT, fontWeight: 600 }}>non‑refundable</span>. For any change, please contact the restaurant at least 1 hour before your slot.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: BG }}
        >
          <div
            className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent"
            style={{ borderColor: `${GOLD} transparent transparent transparent` }}
          />
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}

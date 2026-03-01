'use client';

import { useState, useEffect } from 'react';
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
  calculateBookingAmount,
  calculateEndTime,
  validateTimeSlot
} from '@/utils/booking.utils';
import api from '@/services/api';
import { CreditCard, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface Table {
  tableNumber: string;
  capacity: number;
}

export default function BookingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedTableInfo, setSelectedTableInfo] = useState<Table | null>(null);
  const [bookingConfig, setBookingConfig] = useState<any>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '',
    bookingHours: 1,
    numberOfGuests: 2,
    specialRequests: '',
  });
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [totalBookingAmount, setTotalBookingAmount] = useState<number>(0);
  const [dateDisplay, setDateDisplay] = useState<string>('');

  // Format date from ISO (YYYY-MM-DD) to DD/MM/YYYY for display
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY to ISO format (YYYY-MM-DD)
  const parseDateFromDisplay = (displayDate: string): string => {
    if (!displayDate) return '';
    // Remove any non-digit characters except /
    const cleaned = displayDate.replace(/[^\d/]/g, '');
    const parts = cleaned.split('/').filter(p => p);
    
    if (parts.length === 3) {
      let [day, month, year] = parts;
      
      // Ensure proper padding
      day = day.padStart(2, '0');
      month = month.padStart(2, '0');
      
      // Validate date parts
      if (day.length <= 2 && month.length <= 2 && year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    }
    return '';
  };

  // Handle date input change with DD/MM/YYYY format
  const handleDateChange = (value: string) => {
    // Allow only digits and /
    const cleaned = value.replace(/[^\d/]/g, '');
    
    // Auto-format as user types (DD/MM/YYYY)
    let formatted = cleaned;
    if (cleaned.length > 2 && !cleaned.includes('/')) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (formatted.length > 5 && formatted.split('/').length === 2) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }
    
    setDateDisplay(formatted);
    
    // Convert to ISO format for backend
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
    if (selectedTable && selectedTableInfo) {
      const config = getBookingConfig(selectedTableInfo.capacity);
      setBookingConfig(config);
      // Calculate total booking amount based on hours
      const total = calculateBookingAmount(selectedTableInfo.capacity, formData.bookingHours);
      setTotalBookingAmount(total);
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
        // Validate time slot
        const timeSlotValidation = validateTimeSlot(formData.time);
        if (!timeSlotValidation.valid) {
          setValidationError(timeSlotValidation.error || '');
        } else {
          // Validate end time doesn't exceed booking hours
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

  const handleTableSelect = async (tableNumber: string) => {
    setSelectedTable(tableNumber);
    try {
      // Fetch table details to get capacity
      const tables = await api.get<any[]>('/tables');
      const table = tables.find((t: any) => t.tableNumber === tableNumber);
      if (table) {
        setSelectedTableInfo({ tableNumber: table.tableNumber, capacity: table.capacity });
      }
    } catch (error) {
      console.error('Failed to fetch table details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate 2 hours advance booking
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
      // Create booking first
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
      });

      setBookingId(booking.id || (booking as any)._id);
      
      // Proceed to payment
      await handlePayment(booking.id || (booking as any)._id);
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
      
      // Load Razorpay script
      await loadRazorpayScript();

      // Create payment order
      const paymentOrder = await api.post('/bookings/payment/create', {
        bookingId,
      });

      if (!razorpayKey) {
        throw new Error('Payment gateway not configured');
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Restro OS Restaurant',
        description: `Table Booking Payment - ₹${totalBookingAmount || 0} (${formData.bookingHours} hour${formData.bookingHours > 1 ? 's' : ''})`,
        order_id: paymentOrder.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
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
          color: '#f97316',
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

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-900">
        <div className="container mx-auto px-4 py-8 text-center max-w-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-gray-800/90 border border-orange-500/30 text-orange-100 px-6 py-5 rounded-2xl shadow-2xl backdrop-blur-sm"
          >
            <CheckCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-orange-400">Booking Confirmed!</h2>
            <p className="text-orange-200 mb-2">Your advance payment has been received.</p>
            <p className="text-sm text-orange-300">
              Booking Number: {bookingId ? `BK-${bookingId.slice(-6)}` : 'N/A'}
            </p>
            <p className="text-sm text-orange-300 mt-2">
              We'll send you a confirmation email shortly.
            </p>
            <p className="text-xs text-orange-400/80 mt-4">
              Note: Payment is non-refundable. If your order reaches ₹{bookingConfig?.discountThreshold || 0}, 
              you'll get ₹{bookingConfig?.discountAmount || 0} discount!
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const minDate = getMinBookingDate();
  const minTime = formData.date ? getMinBookingTime(formData.date) : '00:00';

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h1
          className="text-3xl font-bold mb-6 text-orange-400 text-center"
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
              className="bg-gray-800/90 border border-orange-500/30 p-6 md:p-8 rounded-2xl shadow-2xl space-y-4 backdrop-blur-sm"
            >
              {/* Validation Error */}
              {validationError && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{validationError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-300">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-300">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-300">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-orange-300">
                    {t('selectDate')} * (DD/MM/YYYY)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="DD/MM/YYYY"
                      value={dateDisplay}
                      onChange={(e) => handleDateChange(e.target.value)}
                      maxLength={10}
                      className="w-[90%] px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white placeholder-gray-500"
                    />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        setDateDisplay(formatDateForDisplay(e.target.value));
                      }}
                      min={minDate}
                      className="w-12 px-2 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      title="Click to select date"
                    />
                  </div>
                  <p className="text-xs text-orange-300/80 mt-1">
                    You need to book at least 2 hours in advance. For same-day bookings within 2 hours, please call us.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-orange-300">
                    {t('selectTime')} *
                  </label>
                  <input
                    type="time"
                    required
                    min={minTime}
                    max={BOOKING_TIME_SLOTS.endTime}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white"
                  />
                  <p className="text-xs text-orange-300/80 mt-1">
                    Available: {BOOKING_TIME_SLOTS.startTime} - {BOOKING_TIME_SLOTS.endTime}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-300">
                  Booking Hours *
                </label>
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
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white"
                />
                {formData.time && (
                  <p className="text-xs text-orange-300/80 mt-1">
                    End Time: {calculateEndTime(formData.time, formData.bookingHours)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-300">
                  {t('numberOfGuests')} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-orange-300">
                  {t('specialRequests')}
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700/50 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              {/* Table Selection - Always show when date and time are filled */}
              {formData.date && formData.time ? (
                <div className="bg-gray-700/50 rounded-lg p-6 border border-orange-500/30 mt-6">
                  <h3 className="text-xl font-semibold text-orange-300 mb-2">
                    Select Your Table
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Choose a table from the layout below. Green tables are available, red are booked.
                  </p>
                  <TableLayout
                    selectedDate={formData.date}
                    selectedTime={formData.time}
                    numberOfGuests={formData.numberOfGuests}
                    onTableSelect={handleTableSelect}
                    selectedTable={selectedTable}
                  />
                </div>
              ) : (
                <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4 mt-6">
                  <p className="text-sm text-orange-300">
                    <Info className="w-4 h-4 inline mr-2" />
                    Please select a date and time to view available tables.
                  </p>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading || processingPayment || !selectedTable || !!validationError}
                className={`w-full py-3 rounded-full font-semibold text-white shadow-md shadow-orange-500/20 transition ${
                  loading || processingPayment || !selectedTable || !!validationError
                    ? 'bg-orange-600/50 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30'
                }`}
                whileHover={!loading && !processingPayment && selectedTable && !validationError ? { scale: 1.02 } : {}}
                whileTap={!loading && !processingPayment && selectedTable && !validationError ? { scale: 0.98 } : {}}
              >
                {processingPayment ? 'Processing Payment...' : loading ? 'Creating Booking...' : 'Proceed to Payment'}
              </motion.button>
            </form>
          </div>

          {/* Payment Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/90 border border-orange-500/30 p-6 rounded-2xl shadow-2xl backdrop-blur-sm sticky top-4">
              <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Booking Details
              </h3>

              {selectedTable && bookingConfig ? (
                <div className="space-y-4">
                  <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-sm text-orange-300 mb-1">Selected Table</p>
                    <p className="text-lg font-bold text-orange-400">{selectedTable}</p>
                    <p className="text-xs text-orange-300/80 mt-1">Capacity: {selectedTableInfo?.capacity} persons</p>
                  </div>

                  <div className="bg-orange-900/40 border border-orange-500/40 rounded-lg p-4">
                    <p className="text-sm text-orange-300 mb-1">Hourly Rate</p>
                    <p className="text-lg font-bold text-orange-400">₹{bookingConfig.hourlyRate}/hour</p>
                    <p className="text-xs text-orange-300/80 mt-1">
                      {formData.bookingHours} hour{formData.bookingHours > 1 ? 's' : ''} × ₹{bookingConfig.hourlyRate}
                    </p>
                  </div>

                  <div className="bg-orange-900/50 border border-orange-500/50 rounded-lg p-4">
                    <p className="text-sm text-orange-300 mb-1">Total Booking Amount</p>
                    <p className="text-2xl font-bold text-orange-400">₹{totalBookingAmount}</p>
                    <p className="text-xs text-orange-300/80 mt-1">
                      Payment required to confirm booking
                    </p>
                    <p className="text-xs text-orange-400/70 mt-2">
                      <Info className="w-3 h-3 inline mr-1" />
                      Non-refundable
                    </p>
                  </div>

                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                    <p className="text-sm text-green-300 mb-1">Discount Offer</p>
                    <p className="text-lg font-bold text-green-400">
                      Get ₹{bookingConfig.discountAmount} OFF
                    </p>
                    <p className="text-xs text-green-300/80 mt-1">
                      When order reaches ₹{bookingConfig.discountThreshold}
                    </p>
                    <p className="text-xs text-green-400/80 mt-2 font-semibold">
                      ⚠️ Important: Only 1 hour discount applies. When you place an order and it reaches the discount threshold, you will get a discount equal to 1 hour booking rate (₹{bookingConfig.discountAmount}) on your order.
                    </p>
                  </div>

                  <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                    <p className="text-sm text-gray-300 mb-1">Booking Policy</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• You need to book at least 2 hours in advance</li>
                      <li>• Booking hours: {BOOKING_TIME_SLOTS.startTime} - {BOOKING_TIME_SLOTS.endTime}</li>
                      <li>• Table reserved for {formData.bookingHours} hour{formData.bookingHours > 1 ? 's' : ''}</li>
                      <li>• Online payment only</li>
                      <li>• Payment is non-refundable</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-orange-400/50">
                  <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a table to see booking details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

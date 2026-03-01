import { Request, Response } from 'express';
import { Booking } from '../models/Booking.model';
import { createRazorpayOrder, verifyPayment } from '../config/razorpay';
import { sendBookingConfirmationEmail } from '../utils/email';

/**
 * Create Razorpay order for booking advance payment
 */
export const createBookingPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if payment already made
    if (booking.advancePaymentStatus === 'paid') {
      return res.status(400).json({ error: 'Advance payment already completed' });
    }

    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot process payment for cancelled booking' });
    }

    // Check if Razorpay is configured
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        error: 'Payment gateway is not configured. Please contact support.' 
      });
    }

    // Create Razorpay order for total booking amount
    const paymentAmount = booking.totalBookingAmount || booking.advancePayment;
    const razorpayOrder = await createRazorpayOrder(paymentAmount, 'INR');

    // Update booking with payment ID
    booking.paymentId = razorpayOrder.id;
    await booking.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: RAZORPAY_KEY_ID,
      bookingId: booking._id,
      advanceAmount: booking.advancePayment,
      totalBookingAmount: booking.totalBookingAmount,
    });
  } catch (error: any) {
    console.error('Error creating booking payment order:', error);
    res.status(400).json({ error: error.message || 'Failed to create payment order' });
  }
};

/**
 * Verify booking payment and confirm booking
 */
export const verifyBookingPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, razorpayOrderId, paymentId, signature } = req.body;

    if (!bookingId || !razorpayOrderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'All payment details are required' });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify payment signature
    const isValid = await verifyPayment(razorpayOrderId, paymentId, signature);
    
    if (!isValid) {
      booking.advancePaymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update booking status
    booking.advancePaymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = paymentId;
    await booking.save();

    // Send booking confirmation email to customer
    try {
      await sendBookingConfirmationEmail(booking);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the payment verification if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking: booking.toJSON(),
    });
  } catch (error: any) {
    console.error('Error verifying booking payment:', error);
    res.status(400).json({ error: error.message || 'Failed to verify payment' });
  }
};


import { Request, Response } from 'express';
import { createRazorpayOrder, verifyPayment } from '../config/razorpay';
import { Order } from '../models/Order.model';
import { generateBillFromOrderAuto } from './billing.controller';
import { sendBillEmail } from '../utils/email';

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required' });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if Razorpay is configured
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.' 
      });
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(amount, currency);

    // Update order with payment ID
    order.paymentId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    const errorMessage = error?.message || 'Failed to create payment order. Please check Razorpay configuration.';
    res.status(400).json({ error: errorMessage });
  }
};

export const verifyPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, paymentId, signature, dbOrderId } = req.body;

    if (!razorpayOrderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'razorpayOrderId, paymentId, and signature are required' });
    }

    // Verify payment signature
    const isValid = await verifyPayment(razorpayOrderId, paymentId, signature);

    if (!isValid) {
      console.error('Invalid payment signature:', { razorpayOrderId, paymentId });
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Find order by database order ID or payment ID
    let order;
    if (dbOrderId) {
      order = await Order.findById(dbOrderId);
    } else {
      // Fallback: find by payment ID (Razorpay order ID stored in order.paymentId)
      order = await Order.findOne({ paymentId: razorpayOrderId });
    }

    if (!order) {
      console.error('Order not found:', { dbOrderId, razorpayOrderId });
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update payment status and store Razorpay payment ID
    order.paymentStatus = 'paid';
    order.paymentMethod = 'online';
    // Store the actual Razorpay payment ID (not order ID)
    if (paymentId) {
      order.paymentId = paymentId;
    }
    await order.save();

    // Generate bill automatically for online payment
    try {
      const bill = await generateBillFromOrderAuto(order);
      
      // Send bill email to customer if email is available
      if (order.customerEmail && bill) {
        await sendBillEmail(bill, order.customerEmail).catch((error) => {
          console.error('Failed to send bill email:', error);
          // Don't fail the payment verification if email fails
        });
      } else {
        console.log(`⚠️  No email provided for order ${order.orderNumber}. Bill email not sent.`);
      }
    } catch (billError: any) {
      console.error('Error generating bill after payment:', billError);
      // Don't fail payment verification if bill generation fails
      // Payment is already successful, bill can be generated manually later
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to verify payment' });
  }
};


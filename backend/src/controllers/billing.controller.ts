import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Bill } from '../models/Bill.model';
import { Order } from '../models/Order.model';
import { Restaurant } from '../models/Restaurant.model';
import { sendBillReceiptToCustomer } from '../utils/notifications';
import PDFDocument from 'pdfkit';

// Helper to get current user id from auth middleware
const getUserId = (req: Request): string | null => {
  const user = (req as any).user;
  return user?.userId || null;
};

// Helper: get GST (tax) rate from restaurant; default 5%
const getRestaurantTaxRate = async (restaurantId: mongoose.Types.ObjectId): Promise<number> => {
  const restaurant = await Restaurant.findById(restaurantId).select('taxRate').lean();
  const rate = restaurant?.taxRate;
  return typeof rate === 'number' && rate >= 0 ? rate : 5;
};

// Helper function to automatically generate bill from order (for online payments)
export const generateBillFromOrderAuto = async (order: any, generatedBy?: mongoose.Types.ObjectId) => {
  try {
    const existingBill = await Bill.findOne({ orderId: order._id });
    if (existingBill) {
      console.log(`Bill already exists for order ${order.orderNumber}`);
      return existingBill;
    }

    const restaurantId = order.restaurantId;
    if (!restaurantId) throw new Error('Order has no restaurantId');
    const taxRate = await getRestaurantTaxRate(restaurantId);

    const items = order.items.map((item: any) => {
      let itemTotal = item.price * item.quantity;
      if (item.addOns && item.addOns.length > 0) {
        const addOnsTotal = item.addOns.reduce((sum: number, addOn: any) => sum + (addOn.price || 0), 0);
        itemTotal += addOnsTotal * item.quantity;
      }
      return {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: itemTotal,
      };
    });

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const discountAmount = 0;
    const orderTotalFromOrder =
      typeof order.total === 'number' && order.total > 0 ? order.total : undefined;
    const fallbackGrand = subtotal + taxAmount - discountAmount;
    const grandTotal = orderTotalFromOrder ?? fallbackGrand;
    const baseTotal = subtotal + taxAmount - discountAmount;
    const deliveryCharge = Math.max(0, grandTotal - baseTotal);

    const bill = new Bill({
      restaurantId,
      source: 'online',
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      deliveryCharge,
      grandTotal,
      paymentMethod: order.paymentMethod || 'online',
      status: 'paid',
      generatedBy: generatedBy || order._id,
    });

    await bill.save();
    console.log(`✅ Bill generated for order ${order.orderNumber}: ${bill.billNumber} (GST ${taxRate}%)`);
    return bill;
  } catch (error: any) {
    console.error('Error generating bill from order:', error);
    throw error;
  }
};

// Create bill from an existing ONLINE order
export const createBillFromOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, taxRate: bodyTaxRate, discountAmount = 0, paymentMethod = 'cash', notes } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const restaurantId = order.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({ error: 'Order has no restaurant' });
    }
    const gstRate = typeof bodyTaxRate === 'number' && bodyTaxRate >= 0
      ? bodyTaxRate
      : await getRestaurantTaxRate(restaurantId);

    const items = order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = Math.round((subtotal * gstRate) / 100);
    const finalDiscount = Number(discountAmount) || 0;
    const grandTotal = subtotal + taxAmount - finalDiscount;
    const baseTotal = subtotal + taxAmount - finalDiscount;
    const deliveryCharge = Math.max(0, grandTotal - baseTotal);

    const generatedBy = getUserId(req);
    if (!generatedBy) {
      return res.status(403).json({ error: 'User not authorized to generate bill' });
    }

    const bill = new Bill({
      restaurantId,
      source: 'online',
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items,
      subtotal,
      taxAmount,
      discountAmount: finalDiscount,
      deliveryCharge,
      grandTotal,
      paymentMethod,
      status: 'unpaid',
      notes,
      generatedBy,
    });

    await bill.save();

    res.status(201).json(bill);
  } catch (error: any) {
    console.error('Error creating online bill:', error);
    res.status(500).json({ error: error.message || 'Failed to create bill' });
  }
};

// Create OFFLINE bill directly (walk-in customer, no online order)
export const createOfflineBill = async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      taxRate: bodyTaxRate,
      discountAmount = 0,
      paymentMethod = 'cash',
      notes,
    } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'customerName and items are required' });
    }

    const user = (req as any).user;
    const restaurantId = user?.restaurantId;
    if (!restaurantId) {
      return res.status(403).json({ error: 'No restaurant context' });
    }
    const gstRate = typeof bodyTaxRate === 'number' && bodyTaxRate >= 0
      ? bodyTaxRate
      : await getRestaurantTaxRate(restaurantId);

    const normalizedItems = items.map((item: any) => {
      if (!item.name || !item.quantity || !item.price) {
        throw new Error('Each item must have name, quantity and price');
      }
      const qty = Number(item.quantity);
      const price = Number(item.price);
      return {
        name: String(item.name),
        quantity: qty,
        price,
        total: qty * price,
      };
    });

    const subtotal = normalizedItems.reduce((sum: number, item: any) => sum + item.total, 0);
    const taxAmount = Math.round((subtotal * gstRate) / 100);
    const finalDiscount = Number(discountAmount) || 0;
    const grandTotal = subtotal + taxAmount - finalDiscount;
    const baseTotal = subtotal + taxAmount - finalDiscount;
    const deliveryCharge = Math.max(0, grandTotal - baseTotal);

    const generatedBy = getUserId(req);
    if (!generatedBy) {
      return res.status(403).json({ error: 'User not authorized to generate bill' });
    }

    const bill = new Bill({
      restaurantId,
      source: 'offline',
      customerName,
      customerEmail: req.body.customerEmail,
      customerPhone,
      items: normalizedItems,
      subtotal,
      taxAmount,
      discountAmount: finalDiscount,
      deliveryCharge,
      grandTotal,
      paymentMethod,
      status: 'unpaid',
      notes,
      generatedBy,
    });

    await bill.save();

    res.status(201).json(bill);
  } catch (error: any) {
    console.error('Error creating offline bill:', error);
    res.status(500).json({ error: error.message || 'Failed to create offline bill' });
  }
};

// Get all bills (with optional filters)
export const getBills = async (req: Request, res: Response) => {
  try {
    const { source, status, startDate, endDate } = req.query as {
      source?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    };
    const filter: any = {};
    const user = (req as any).user;
    if (user?.restaurantId) {
      filter.restaurantId = user.restaurantId;
    }
    if (source) {
      filter.source = source;
    }
    if (status) {
      filter.status = status;
    }

    // Optional date range filter (createdAt)
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const bills = await Bill.find(filter)
      .populate('orderId')
      .populate('generatedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error: any) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bills' });
  }
};

// Get single bill
export const getBill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const bill = await Bill.findById(id)
      .populate('orderId')
      .populate('generatedBy', 'name email role');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    if (user?.restaurantId && String(bill.restaurantId) !== String(user.restaurantId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(bill);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch bill' });
  }
};

// Update bill payment status (mark as paid when cash received)
export const updateBillStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, customerEmail } = req.body;

    const bill = await Bill.findByIdAndUpdate(
      id,
      {
        ...(status ? { status } : {}),
        ...(paymentMethod ? { paymentMethod } : {}),
        ...(customerEmail ? { customerEmail } : {}),
      },
      { new: true, runValidators: true }
    )
      .populate('restaurantId', 'name whatsappApiUrl whatsappApiKey');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (status === 'paid' && bill.status === 'paid') {
      const restaurant = bill.restaurantId as any;
      sendBillReceiptToCustomer(bill, {
        whatsappApiUrl: restaurant?.whatsappApiUrl,
        whatsappApiKey: restaurant?.whatsappApiKey,
      }).catch((err) => console.error('Send bill receipt failed:', err?.message || err));
    }

    res.json(bill);
  } catch (error: any) {
    console.error('Error updating bill status:', error);
    res.status(400).json({ error: error.message || 'Failed to update bill status' });
  }
};

// Generate billing report as PDF for a given period (day/week/month/year or custom range)
export const getBillingReportPdf = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const restaurantId = user?.restaurantId as mongoose.Types.ObjectId | undefined;
    if (!restaurantId) {
      return res.status(403).json({ error: 'No restaurant context' });
    }

    const { period = 'day', startDate, endDate } = req.query as {
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
    };

    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (startDate || endDate) {
      start = startDate ? new Date(startDate) : new Date('1970-01-01');
      end = endDate ? new Date(endDate) : now;
    } else {
      switch (period) {
        case 'week': {
          // last 7 days
          start = new Date(now);
          start.setDate(start.getDate() - 7);
          break;
        }
        case 'month': {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        }
        case 'year': {
          start = new Date(now.getFullYear(), 0, 1);
          break;
        }
        case 'day':
        default: {
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        }
      }
    }
    // Normalize times
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      restaurantId,
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: 1 })
      .lean();

    const restaurant = await Restaurant.findById(restaurantId).select('name taxRate').lean();
    const restaurantName = restaurant?.name || 'Your Restaurant';
    const taxRate = typeof restaurant?.taxRate === 'number' ? restaurant.taxRate : 5;

    const totals = bills.reduce(
      (acc, b: any) => {
        acc.subtotal += b.subtotal || 0;
        acc.taxAmount += b.taxAmount || 0;
        acc.discountAmount += b.discountAmount || 0;
        acc.deliveryCharge += b.deliveryCharge || 0;
        acc.grandTotal += b.grandTotal || 0;
        return acc;
      },
      { subtotal: 0, taxAmount: 0, discountAmount: 0, deliveryCharge: 0, grandTotal: 0 }
    );

    const doc = new PDFDocument({ margin: 40 });
    const filename = `billing-report-${period}-${now.toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.fontSize(18).text('Restro OS - Billing Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Restaurant: ${restaurantName}`);
    doc.text(`GST Rate: ${taxRate}%`);
    doc.text(
      `Period: ${start.toISOString().slice(0, 10)} to ${end.toISOString().slice(0, 10)} (${period})`
    );
    doc.moveDown();

    doc.fontSize(12).text('Summary:', { underline: true });
    doc.text(`Subtotal: ₹${totals.subtotal.toFixed(0)}`);
    doc.text(`GST: ₹${totals.taxAmount.toFixed(0)}`);
    doc.text(`Discount: -₹${totals.discountAmount.toFixed(0)}`);
    doc.text(`Delivery: ₹${totals.deliveryCharge.toFixed(0)}`);
    doc.text(`Grand Total: ₹${totals.grandTotal.toFixed(0)}`);
    doc.moveDown();

    doc.text('Bills:', { underline: true });
    doc.moveDown(0.5);

    if (bills.length === 0) {
      doc.text('No bills found for this period.');
    } else {
      bills.forEach((b: any) => {
        const dateStr = new Date(b.createdAt).toLocaleString('en-IN');
        doc
          .fontSize(11)
          .text(
            `${dateStr}  |  ${b.billNumber || ''}  |  Total: ₹${(b.grandTotal || 0).toFixed(
              0
            )}  |  Status: ${b.status}  |  Payment: ${b.paymentMethod}`,
            { lineGap: 2 }
          );
      });
    }

    doc.end();
    doc.pipe(res);
  } catch (error: any) {
    console.error('Error generating billing report PDF:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report PDF' });
  }
};



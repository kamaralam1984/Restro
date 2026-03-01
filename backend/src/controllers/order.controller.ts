import { Request, Response } from 'express';
import { Order } from '../models/Order.model';
import { Menu } from '../models/Menu.model';
import { Booking } from '../models/Booking.model';
import { orderService } from '../services/order.service';
import { getBookingConfig, checkDiscountEligibility } from '../utils/booking.utils';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, customerName, customerEmail, customerPhone, tableNumber, notes } = req.body;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    // Validate items and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.menuItemId) {
        return res.status(400).json({ error: 'menuItemId is required for each item' });
      }

      const menuItem = await Menu.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item with ID ${item.menuItemId} not found` });
      }
      
      if (!menuItem.available) {
        return res.status(400).json({ error: `Menu item "${menuItem.name}" is not available` });
      }

      // Calculate base price
      let itemTotal = menuItem.price * item.quantity;
      
      // Add add-ons price
      if (item.addOns && item.addOns.length > 0) {
        const addOnsTotal = item.addOns.reduce((sum: number, addOn: any) => sum + (addOn.price || 0), 0);
        itemTotal += addOnsTotal * item.quantity;
      }
      
      total += itemTotal;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        addOns: item.addOns || [],
        customizations: item.customizations || '',
      });
    }

    const { paymentMethod = 'online' } = req.body;
    
    // Check for booking discount if table number is provided
    let discountAmount = 0;
    let bookingDiscountApplied = false;
    
    if (tableNumber) {
      // Find active booking for this table
      const booking = await Booking.findOne({
        tableNumber,
        status: 'confirmed',
        advancePaymentStatus: 'paid',
      }).sort({ createdAt: -1 }); // Get most recent booking
      
      if (booking && booking.tableCapacity) {
        const bookingConfig = getBookingConfig(booking.tableCapacity);
        
        // Check if order total meets discount threshold
        if (checkDiscountEligibility(total, bookingConfig.discountThreshold)) {
          discountAmount = bookingConfig.discountAmount;
          bookingDiscountApplied = true;
          
          // Update booking with discount applied
          booking.discountApplied = true;
          booking.orderTotal = total;
          await booking.save();
        } else {
          // Update booking with order total (even if discount not applied)
          booking.orderTotal = total;
          await booking.save();
        }
      }
    }
    
    const finalTotal = Math.max(0, total - discountAmount);
    
    const order = new Order({
      items: orderItems,
      total: finalTotal,
      customerName,
      customerEmail,
      customerPhone,
      tableNumber,
      notes,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      paymentMethod: paymentMethod === 'cod' ? 'cash' : paymentMethod,
    });

    await order.save();
    
    // Add discount info to response if applied
    const orderResponse: any = order.toJSON();
    if (bookingDiscountApplied) {
      orderResponse.discountApplied = true;
      orderResponse.discountAmount = discountAmount;
      orderResponse.originalTotal = total;
    }

    // Send WhatsApp notification
    await orderService.sendOrderNotification(order);

    // Convert to JSON and ensure id field is available
    const orderJson = order.toJSON();
    res.status(201).json({
      ...orderJson,
      id: orderJson._id || orderJson.id,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, limit } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    let query = Order.find(filter)
      .populate('items.menuItemId')
      .sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit as string));
    }

    const orders = await query;

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.menuItemId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update order status' });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, paymentId } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus, paymentMethod, paymentId },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update payment status' });
  }
};


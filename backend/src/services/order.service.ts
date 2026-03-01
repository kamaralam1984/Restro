import { IOrder } from '../models/Order.model';
import { IBooking } from '../models/Booking.model';
import { sendWhatsAppMessage } from '../utils/whatsapp';

export const orderService = {
  async sendOrderNotification(order: IOrder): Promise<void> {
    try {
      const message = `
🍽️ New Order Received!

Order Number: ${order.orderNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Total: $${order.total.toFixed(2)}
Status: ${order.status}

Items:
${order.items.map(item => `- ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`).join('\n')}
      `.trim();

      // Send to admin/staff WhatsApp
      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        await sendWhatsAppMessage(adminPhone, message);
      } else {
        console.log('⚠️  ADMIN_PHONE not configured. Order notification not sent.');
      }

      // Send confirmation to customer
      if (order.customerPhone) {
        const customerMessage = `
✅ Order Confirmed!

Your order ${order.orderNumber} has been received.
Total: $${order.total.toFixed(2)}

We'll notify you when it's ready!
        `.trim();
        await sendWhatsAppMessage(order.customerPhone, customerMessage);
      }
    } catch (error) {
      console.error('Failed to send order notification:', error);
      // Don't throw - notification failure shouldn't break order creation
    }
  },

  async sendBookingNotification(booking: IBooking): Promise<void> {
    try {
      const message = `
📅 New Booking Received!

Booking Number: ${booking.bookingNumber}
Customer: ${booking.customerName}
Phone: ${booking.customerPhone}
Date: ${booking.date.toLocaleDateString()}
Time: ${booking.time}
Guests: ${booking.numberOfGuests}
Status: ${booking.status}
      `.trim();

      // Send to admin/staff WhatsApp
      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        await sendWhatsAppMessage(adminPhone, message);
      } else {
        console.log('⚠️  ADMIN_PHONE not configured. Booking notification not sent.');
      }

      // Send confirmation to customer
      const customerMessage = `
✅ Booking Confirmed!

Your reservation ${booking.bookingNumber} has been received.
Date: ${booking.date.toLocaleDateString()}
Time: ${booking.time}
Guests: ${booking.numberOfGuests}

We'll confirm shortly!
      `.trim();
      await sendWhatsAppMessage(booking.customerPhone, customerMessage);
    } catch (error) {
      console.error('Failed to send booking notification:', error);
    }
  },
};


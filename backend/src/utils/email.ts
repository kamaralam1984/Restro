import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { IBill } from '../models/Bill.model';
import { Restaurant } from '../models/Restaurant.model';
import { IBooking } from '../models/Booking.model';

dotenv.config();

// Create email transporter
const createTransporter = () => {
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASSWORD;

  if (!SMTP_USER || !SMTP_PASS) {
    console.log('⚠️  Email credentials not configured. Email sending disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// Generate HTML bill template
const generateBillHTML = (bill: IBill, restaurantName: string): string => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .bill-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .bill-number { font-size: 24px; font-weight: bold; color: #f97316; margin: 10px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .table th { background: #f3f4f6; font-weight: bold; }
    .total-row { font-weight: bold; background: #fef3c7; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ ${restaurantName}</h1>
      <p>Thank you for your order</p>
    </div>
    <div class="content">
      <div class="bill-info">
        <h2>Bill Receipt</h2>
        <div class="bill-number">${bill.billNumber}</div>
        <p><strong>Customer:</strong> ${bill.customerName}</p>
        ${bill.customerPhone ? `<p><strong>Phone:</strong> ${bill.customerPhone}</p>` : ''}
        <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString('en-IN')}</p>
        <p><strong>Payment Method:</strong> ${bill.paymentMethod.toUpperCase()}</p>
        <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PAID</span></p>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${bill.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.price)}</td>
              <td>${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <table class="table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">${formatCurrency(bill.subtotal)}</td>
        </tr>
        ${bill.taxAmount > 0 ? `
        <tr>
          <td>GST:</td>
          <td style="text-align: right;">${formatCurrency(bill.taxAmount)}</td>
        </tr>
        ` : ''}
        ${bill.deliveryCharge > 0 ? `
        <tr>
          <td>Delivery:</td>
          <td style="text-align: right;">${formatCurrency(bill.deliveryCharge)}</td>
        </tr>
        ` : ''}
        ${bill.discountAmount > 0 ? `
        <tr>
          <td>Discount:</td>
          <td style="text-align: right;">-${formatCurrency(bill.discountAmount)}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td><strong>Grand Total:</strong></td>
          <td style="text-align: right;"><strong>${formatCurrency(bill.grandTotal)}</strong></td>
        </tr>
      </table>

      <div class="footer">
        <p>Thank you for dining with us!</p>
        <p>Visit us again at ${restaurantName}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Send bill via email
export const sendBillEmail = async (bill: IBill, customerEmail: string): Promise<void> => {
  try {
    if (!customerEmail) {
      console.log('⚠️  No customer email provided. Bill email not sent.');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.log('⚠️  Email transporter not configured. Bill email not sent.');
      return;
    }

    // Resolve restaurant name from bill -> restaurant
    let restaurantName = process.env.APP_BRAND_NAME || 'Restro OS';
    try {
      const restField: any = (bill as any).restaurantId;
      if (restField) {
        if (typeof restField === 'object' && 'name' in restField) {
          restaurantName = (restField as any).name || restaurantName;
        } else {
          const doc = await Restaurant.findById(restField).select('name').lean();
          if (doc?.name) restaurantName = doc.name;
        }
      }
    } catch {
      // ignore, fall back to default brand name
    }

    const htmlContent = generateBillHTML(bill, restaurantName);
    const textContent = `
${restaurantName} - Bill Receipt

Bill Number: ${bill.billNumber}
Customer: ${bill.customerName}
Date: ${new Date(bill.createdAt).toLocaleString('en-IN')}
Payment Method: ${bill.paymentMethod.toUpperCase()}
Status: PAID

Items:
${bill.items.map(item => `- ${item.name} x${item.quantity} = ₹${item.total}`).join('\n')}

Subtotal: ₹${bill.subtotal}
${bill.taxAmount > 0 ? `GST: ₹${bill.taxAmount}\n` : ''}
${bill.deliveryCharge > 0 ? `Delivery: ₹${bill.deliveryCharge}\n` : ''}
${bill.discountAmount > 0 ? `Discount: -₹${bill.discountAmount}\n` : ''}
Grand Total: ₹${bill.grandTotal}

Thank you for dining with us!
    `.trim();

    const mailOptions = {
      from: `"${restaurantName}" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Bill Receipt - ${bill.billNumber}`,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Bill email sent to ${customerEmail}`);
  } catch (error: any) {
    console.error('❌ Failed to send bill email:', error);
    // Don't throw error - email failure shouldn't break the payment process
  }
};

interface VisitorInfoPayload {
  name?: string;
  email: string;
  country?: string;
  state?: string;
  city?: string;
  lastSeenAt?: Date;
}

export const sendVisitorInfoEmail = async (visitor: VisitorInfoPayload): Promise<void> => {
  try {
    if (!visitor.email) {
      console.log('⚠️  Visitor email missing. Info email not sent.');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.log('⚠️  Email transporter not configured. Visitor info email not sent.');
      return;
    }

    const toName = visitor.name || 'Friend';
    const when =
      visitor.lastSeenAt instanceof Date
        ? visitor.lastSeenAt.toLocaleString('en-IN')
        : new Date().toLocaleString('en-IN');

    const locationParts = [visitor.city, visitor.state, visitor.country].filter(Boolean);
    const location = locationParts.length ? locationParts.join(', ') : 'your area';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charSet="UTF-8" />
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0f172a; color:#e5e7eb; padding:0; margin:0;}
    .wrap { max-width:640px; margin:0 auto; padding:24px;}
    .card { background:#020617; border-radius:16px; padding:24px; border:1px solid #1e293b; }
    .badge { display:inline-block; padding:4px 10px; border-radius:999px; font-size:12px; background:#f97316; color:white; font-weight:600; }
    .btn { display:inline-block; padding:10px 18px; border-radius:999px; background:#f97316; color:white; text-decoration:none; font-weight:600; margin-top:16px;}
    h1 { font-size:24px; margin-bottom:8px; color:#e5e7eb;}
    p { font-size:14px; line-height:1.6; margin:4px 0; color:#cbd5f5;}
    ul { padding-left:20px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <span class="badge">Welcome to Restro OS</span>
      <h1>Hi ${toName}, thanks for visiting 👋</h1>
      <p>We noticed you recently checked out our restaurant management platform from <strong>${location}</strong> on <strong>${when}</strong>.</p>
      <p>Restro OS helps you manage:</p>
      <ul>
        <li>Online & walk-in orders with smart billing</li>
        <li>Table booking automation (no double bookings)</li>
        <li>Menu, staff & role control in one dashboard</li>
        <li>Analytics for peak hours & best-selling items</li>
      </ul>
      <p>You can start a free trial any time and set up your first restaurant in a few minutes.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/restaurant/signup" class="btn">
        Start Free Trial
      </a>
      <p style="margin-top:20px;font-size:12px;color:#64748b;">
        If you received this email by mistake, you can safely ignore it.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: `"Restro OS" <${process.env.SMTP_USER}>`,
      to: visitor.email,
      subject: 'Thanks for visiting Restro OS 👋',
      html,
    });

    console.log(`✅ Visitor info email sent to ${visitor.email}`);
  } catch (error: any) {
    console.error('❌ Failed to send visitor info email:', error?.message || error);
  }
};

// Generate HTML booking confirmation template
const generateBookingConfirmationHTML = (booking: IBooking): string => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate discount threshold based on table capacity
  const getDiscountThreshold = (capacity?: number): number => {
    if (!capacity) return 0;
    if (capacity >= 6) return 1500;
    if (capacity >= 4) return 1000;
    return 500;
  };

  const discountThreshold = getDiscountThreshold(booking.tableCapacity);
  const bookingDate = new Date(booking.date);
  const bookingDateTime = `${formatDate(bookingDate)} at ${booking.time}`;
  const endTime = booking.endTime || 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .booking-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .booking-number { font-size: 24px; font-weight: bold; color: #f97316; margin: 10px 0; }
    .info-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; color: #6b7280; }
    .info-value { color: #111827; }
    .amount-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .amount-label { font-size: 14px; color: #92400e; }
    .amount-value { font-size: 32px; font-weight: bold; color: #f97316; margin: 10px 0; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-confirmed { background: #d1fae5; color: #065f46; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    .note-box { background: #fef3c7; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Silver Plate</h1>
      <p>Pure & Delicious</p>
    </div>
    <div class="content">
      <div class="booking-info">
        <h2>Table Booking Confirmation</h2>
        <div class="booking-number">${booking.bookingNumber}</div>
        <span class="status-badge status-confirmed">CONFIRMED</span>
        
        <div style="margin-top: 20px;">
          <div class="info-row">
            <span class="info-label">Customer Name:</span>
            <span class="info-value">${booking.customerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${booking.customerEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${booking.customerPhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking Date & Time:</span>
            <span class="info-value">${bookingDateTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">End Time:</span>
            <span class="info-value">${endTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration:</span>
            <span class="info-value">${booking.bookingHours} hour${booking.bookingHours > 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Number of Guests:</span>
            <span class="info-value">${booking.numberOfGuests} person${booking.numberOfGuests > 1 ? 's' : ''}</span>
          </div>
          ${booking.tableNumber ? `
          <div class="info-row">
            <span class="info-label">Table Number:</span>
            <span class="info-value">${booking.tableNumber}</span>
          </div>
          ${booking.tableCapacity ? `
          <div class="info-row">
            <span class="info-label">Table Capacity:</span>
            <span class="info-value">${booking.tableCapacity} persons</span>
          </div>
          ` : ''}
          ` : ''}
          ${booking.specialRequests ? `
          <div class="info-row">
            <span class="info-label">Special Requests:</span>
            <span class="info-value">${booking.specialRequests}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="amount-box">
        <div class="amount-label">Advance Booking Payment</div>
        <div class="amount-value">${formatCurrency(booking.totalBookingAmount)}</div>
        <div style="font-size: 12px; color: #92400e; margin-top: 5px;">
          Payment Status: <strong>PAID</strong>
        </div>
      </div>

      <div class="note-box">
        <strong>📋 Important Notes:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Please arrive on time for your reservation</li>
          <li>Your table is reserved for ${booking.bookingHours} hour${booking.bookingHours > 1 ? 's' : ''}</li>
          ${discountThreshold > 0 ? `<li>If your order reaches ${formatCurrency(discountThreshold)}, you'll get a discount equal to 1 hour booking rate!</li>` : ''}
          <li>Payment is non-refundable</li>
        </ul>
      </div>

      <div class="footer">
        <p>Thank you for choosing Silver Plate!</p>
        <p>We look forward to serving you.</p>
        <p style="margin-top: 20px; font-size: 12px;">
          For any queries, please contact us or reply to this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (booking: IBooking): Promise<void> => {
  try {
    if (!booking.customerEmail) {
      console.log('⚠️  No customer email provided. Booking confirmation email not sent.');
      return;
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.log('⚠️  Email transporter not configured. Booking confirmation email not sent.');
      return;
    }

    const htmlContent = generateBookingConfirmationHTML(booking);
    const bookingDate = new Date(booking.date);
    const bookingDateTime = `${bookingDate.toLocaleDateString('en-IN')} at ${booking.time}`;
    
    const textContent = `
Silver Plate - Table Booking Confirmation

Booking Number: ${booking.bookingNumber}
Status: CONFIRMED

Customer Details:
- Name: ${booking.customerName}
- Email: ${booking.customerEmail}
- Phone: ${booking.customerPhone}

Booking Details:
- Date & Time: ${bookingDateTime}
- End Time: ${booking.endTime || 'N/A'}
- Duration: ${booking.bookingHours} hour${booking.bookingHours > 1 ? 's' : ''}
- Number of Guests: ${booking.numberOfGuests} person${booking.numberOfGuests > 1 ? 's' : ''}
${booking.tableNumber ? `- Table Number: ${booking.tableNumber}\n${booking.tableCapacity ? `- Table Capacity: ${booking.tableCapacity} persons\n` : ''}` : ''}
${booking.specialRequests ? `- Special Requests: ${booking.specialRequests}\n` : ''}

Payment Details:
- Advance Booking Payment: ₹${booking.totalBookingAmount}
- Payment Status: PAID

Important Notes:
- Please arrive on time for your reservation
- Your table is reserved for ${booking.bookingHours} hour${booking.bookingHours > 1 ? 's' : ''}
- Payment is non-refundable

Thank you for choosing Silver Plate!
We look forward to serving you.

For any queries, please contact us.
    `.trim();

    const mailOptions = {
      from: `"Silver Plate" <${process.env.SMTP_USER}>`,
      to: booking.customerEmail,
      subject: `Table Booking Confirmed - ${booking.bookingNumber}`,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${booking.customerEmail}`);
  } catch (error: any) {
    console.error('❌ Failed to send booking confirmation email:', error);
    // Don't throw error - email failure shouldn't break the booking process
  }
};

/** Send subscription/trial expiry warning to restaurant owner. */
export async function sendSubscriptionExpiryWarning(params: {
  toEmail: string;
  restaurantName: string;
  storeLink: string;
}): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) return;

  const { toEmail, restaurantName, storeLink } = params;
  const html = `
    <p>Hello,</p>
    <p>Your subscription or trial for <strong>${restaurantName}</strong> has expired.</p>
    <p>To continue using Restro OS, please renew your subscription.</p>
    <p><a href="${storeLink}">Log in to renew</a></p>
    <p>— Restro OS</p>
  `;
  try {
    await transporter.sendMail({
      from: `"Restro OS" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Subscription expired – ${restaurantName}`,
      html,
      text: `Your subscription for ${restaurantName} has expired. Log in to renew: ${storeLink}`,
    });
  } catch (err: any) {
    console.error('Failed to send subscription expiry email:', err?.message);
  }
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/** Send contact form submission to client (restaurant/admin). */
export async function sendContactFormNotification(
  toEmail: string,
  payload: ContactFormPayload
): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('Email is not configured. Set SMTP_USER and SMTP_PASSWORD.');
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}.container{max-width:600px;margin:0 auto;padding:20px;}.header{background:#f97316;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;}.content{background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;}.row{margin:12px 0;}.label{font-weight:bold;color:#6b7280;}.footer{text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;}</style></head>
<body>
  <div class="container">
    <div class="header"><h2>📩 New Contact Form Message</h2><p>Restro OS – website contact</p></div>
    <div class="content">
      <div class="row"><span class="label">Name:</span> ${payload.name}</div>
      <div class="row"><span class="label">Email:</span> <a href="mailto:${payload.email}">${payload.email}</a></div>
      ${payload.phone ? `<div class="row"><span class="label">Phone:</span> ${payload.phone}</div>` : ''}
      <div class="row"><span class="label">Subject:</span> ${payload.subject}</div>
      <div class="row"><span class="label">Message:</span></div>
      <p style="white-space:pre-wrap;background:white;padding:12px;border-radius:6px;">${(payload.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>
    <div class="footer">Sent via Restro OS contact form</div>
  </div>
</body>
</html>`;

  const mailOptions = {
    from: `"Restro OS" <${process.env.SMTP_USER}>`,
    to: toEmail,
    replyTo: payload.email,
    subject: `[Contact] ${payload.subject} – ${payload.name}`,
    html: htmlContent,
    text: `Name: ${payload.name}\nEmail: ${payload.email}\n${payload.phone ? `Phone: ${payload.phone}\n` : ''}Subject: ${payload.subject}\n\nMessage:\n${payload.message}`,
  };

  await transporter.sendMail(mailOptions);
}

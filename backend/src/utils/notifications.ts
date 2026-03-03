/**
 * Send billing receipt to customer via Email, SMS, and WhatsApp.
 *
 * Email: uses existing SMTP (sendBillEmail).
 *
 * SMS (optional): set one of:
 *   - Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 *   - MSG91:  MSG91_AUTH_KEY, MSG91_SENDER_ID (optional, default RESTRO)
 *
 * WhatsApp (optional): set one of:
 *   - Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886)
 *   - Generic: WHATSAPP_API_URL, WHATSAPP_API_KEY (POST with to/message in body)
 *   - Per-restaurant: bill's restaurant can have whatsappApiUrl, whatsappApiKey
 */
import { IBill } from '../models/Bill.model';
import { sendBillEmail } from './email';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/** Build a short receipt text for SMS/WhatsApp */
function getReceiptSummary(bill: IBill): string {
  const lines = [
    `Bill ${bill.billNumber}`,
    `Customer: ${bill.customerName}`,
    `Date: ${new Date(bill.createdAt).toLocaleString('en-IN')}`,
    `Subtotal: ${formatCurrency(bill.subtotal)}`,
  ];
  if (bill.taxAmount > 0) lines.push(`GST: ${formatCurrency(bill.taxAmount)}`);
  if (bill.deliveryCharge > 0) lines.push(`Delivery: ${formatCurrency(bill.deliveryCharge)}`);
  if (bill.discountAmount > 0) lines.push(`Discount: -${formatCurrency(bill.discountAmount)}`);
  lines.push(`Total: ${formatCurrency(bill.grandTotal)}`);
  lines.push('Thank you!');
  return lines.join('\n');
}

function normalizeIndianPhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = '91' + p.slice(1);
  else if (p.length === 10) p = '91' + p;
  else if (!p.startsWith('91')) p = '91' + p;
  return p;
}

/** Send SMS via Twilio or MSG91 (optional) */
export async function sendBillSms(phone: string, bill: IBill): Promise<void> {
  if (!phone || !phone.trim()) return;
  const text = getReceiptSummary(bill);
  const toNumber = normalizeIndianPhone(phone);

  // Twilio
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (accountSid && authToken && fromNumber) {
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          },
          body: new URLSearchParams({
            To: '+' + toNumber,
            From: fromNumber,
            Body: text,
          }).toString(),
        }
      );
      if (!res.ok) {
        const err = await res.text();
        console.error('Twilio SMS failed:', res.status, err);
        return;
      }
      console.log(`✅ Bill SMS sent to ${phone}`);
      return;
    } catch (e: any) {
      console.error('Twilio SMS error:', e?.message || e);
      return;
    }
  }

  // MSG91 (India) - sendhttp.php
  const msg91Auth = process.env.MSG91_AUTH_KEY;
  const msg91Sender = (process.env.MSG91_SENDER_ID || 'RESTRO').slice(0, 6);
  if (msg91Auth) {
    try {
      const mobile = normalizeIndianPhone(phone);
      if (!mobile.startsWith('91')) return;
      const params = new URLSearchParams({
        authkey: msg91Auth,
        mobiles: mobile,
        message: text,
        sender: msg91Sender,
        route: '4', // transactional
      });
      const res = await fetch(`https://api.msg91.com/api/sendhttp.php?${params.toString()}`);
      const body = await res.text();
      if (!res.ok || (body && body.toLowerCase().includes('error'))) {
        console.error('MSG91 SMS failed:', body || res.status);
        return;
      }
      console.log(`✅ Bill SMS sent to ${phone} (MSG91)`);
    } catch (e: any) {
      console.error('MSG91 SMS error:', e?.message || e);
    }
  }
}

/** Send WhatsApp message (Twilio WhatsApp or generic webhook) */
export async function sendBillWhatsApp(
  phone: string,
  bill: IBill,
  options?: { apiUrl?: string; apiKey?: string }
): Promise<void> {
  if (!phone || !phone.trim()) return;
  const text = getReceiptSummary(bill);
  const normalizedPhone = normalizeIndianPhone(phone);
  const toWhatsApp = `whatsapp:+${normalizedPhone}`;

  // Restaurant-specific WhatsApp config
  const apiUrl = options?.apiUrl || process.env.WHATSAPP_API_URL;
  const apiKey = options?.apiKey || process.env.WHATSAPP_API_KEY;

  if (apiUrl && apiKey) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(process.env.WHATSAPP_HEADER_KEY && {
            [process.env.WHATSAPP_HEADER_KEY]: apiKey,
          }),
        },
        body: JSON.stringify({
          to: normalizedPhone,
          message: text,
          ...(process.env.WHATSAPP_BODY_TO_FIELD && {
            [process.env.WHATSAPP_BODY_TO_FIELD]: normalizedPhone,
          }),
        }),
      });
      if (!res.ok) console.error('WhatsApp API failed:', res.status, await res.text());
      else console.log(`✅ Bill WhatsApp sent to ${phone}`);
      return;
    } catch (e: any) {
      console.error('WhatsApp API error:', e?.message || e);
      return;
    }
  }

  // Twilio WhatsApp
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
  if (accountSid && authToken && fromWhatsApp) {
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          },
          body: new URLSearchParams({
            To: toWhatsApp,
            From: fromWhatsApp,
            Body: text,
          }).toString(),
        }
      );
      if (!res.ok) console.error('Twilio WhatsApp failed:', await res.text());
      else console.log(`✅ Bill WhatsApp sent to ${phone} (Twilio)`);
    } catch (e: any) {
      console.error('Twilio WhatsApp error:', e?.message || e);
    }
  }
}

/** Send receipt to customer via Email, SMS, and WhatsApp. Does not throw. */
export async function sendBillReceiptToCustomer(
  bill: IBill,
  options?: { restaurantName?: string; whatsappApiUrl?: string; whatsappApiKey?: string }
): Promise<void> {
  const email = bill.customerEmail?.trim();
  const phone = bill.customerPhone?.trim();

  if (email) {
    sendBillEmail(bill, email).catch((err) =>
      console.error('Bill email failed:', err?.message || err)
    );
  } else {
    console.log(`⚠️  No customer email for bill ${bill.billNumber}. Email not sent.`);
  }

  if (phone) {
    sendBillSms(phone, bill).catch((err) =>
      console.error('Bill SMS failed:', err?.message || err)
    );
    sendBillWhatsApp(phone, bill, {
      apiUrl: options?.whatsappApiUrl,
      apiKey: options?.whatsappApiKey,
    }).catch((err) =>
      console.error('Bill WhatsApp failed:', err?.message || err)
    );
  }
}

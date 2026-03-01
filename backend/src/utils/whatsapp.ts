import dotenv from 'dotenv';

dotenv.config();

// WhatsApp integration utility
// In production, integrate with WhatsApp Business API or Twilio
export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  try {
    const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
    const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
    const NODE_ENV = process.env.NODE_ENV || 'development';

    if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
      // In development, log the message
      if (NODE_ENV === 'development') {
        console.log(`[DEV] WhatsApp message to ${phone}:`, message);
      } else {
        console.log('WhatsApp API not configured. Message would be sent to:', phone);
        console.log('Message:', message);
      }
      return;
    }

    // Example integration with WhatsApp Business API
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({
        to: phone,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    console.log(`✅ WhatsApp message sent to ${phone}`);
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    // In development, just log the message
    const NODE_ENV = process.env.NODE_ENV || 'development';
    if (NODE_ENV === 'development') {
      console.log(`[DEV] WhatsApp message to ${phone}:`, message);
    }
  }
}

// Format phone number for WhatsApp (remove non-digits, add country code if needed)
export function formatPhoneForWhatsApp(phone: string, countryCode: string = '+1'): string {
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If phone doesn't start with country code, add it
  if (!phone.startsWith('+')) {
    return `${countryCode}${digitsOnly}`;
  }
  
  return `+${digitsOnly}`;
}


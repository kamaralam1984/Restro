import { Request, Response } from 'express';
import { sendContactFormNotification } from '../utils/email';

/** POST /api/contact — website contact form. Sends email to client (CONTACT_EMAIL or SMTP_USER). */
export async function submitContact(req: Request, res: Response) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const toEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    if (!toEmail) {
      return res.status(503).json({
        error: 'Contact form is not configured. Please set CONTACT_EMAIL or SMTP_USER.',
      });
    }

    await sendContactFormNotification(toEmail, {
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === 'string' ? phone.trim() || undefined : undefined,
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(200).json({ message: 'Message sent successfully. We will get back to you soon.' });
  } catch (err: any) {
    console.error('Contact form error:', err);
    res.status(500).json({
      error: err?.message || 'Failed to send message. Please try again later.',
    });
  }
}

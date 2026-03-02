/**
 * Razorpay subscription webhook: recurring payment success/failure, cancel.
 * Verify signature with RAZORPAY_WEBHOOK_SECRET (set in Razorpay dashboard for this endpoint).
 * Events: subscription.charged, subscription.cancelled, payment.failed
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import { Subscription } from '../models/Subscription.model';
import { Restaurant } from '../models/Restaurant.model';
import { logger } from '../utils/logger';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
  return expected === signature;
}

const GRACE_DAYS = parseInt(process.env.SUBSCRIPTION_GRACE_DAYS || '3', 10);

export async function razorpaySubscriptionWebhook(req: Request, res: Response) {
  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }
  // Body is Buffer when route uses express.raw()
  const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  if (!verifyWebhookSignature(bodyStr, signature)) {
    logger.warn('Razorpay webhook: invalid signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let payload: { event: string; payload?: { subscription?: { id: string }; payment?: { entity?: { id: string } } } };
  try {
    payload = JSON.parse(bodyStr);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const event = payload.event;
  if (!event) {
    return res.status(400).json({ error: 'Missing event' });
  }

  const pl = payload.payload as any;
  const getSubId = (): string | undefined =>
    pl?.subscription?.entity?.id || pl?.subscription?.id || pl?.payment?.entity?.subscription_id;

  try {
    if (event === 'subscription.charged') {
      const subId = getSubId();
      if (!subId) {
        res.status(200).send('OK');
        return;
      }
      const sub = await Subscription.findOne({ razorpaySubscriptionId: subId }).lean();
      if (!sub) {
        res.status(200).send('OK');
        return;
      }
      const cycleEnd = new Date();
      cycleEnd.setMonth(cycleEnd.getMonth() + (sub.billingCycle === 'yearly' ? 12 : 1));
      await Subscription.updateOne(
        { _id: sub._id },
        {
          $set: {
            status: 'active',
            endDate: cycleEnd,
            nextBillingDate: cycleEnd,
            gracePeriodEndsAt: null,
          },
        }
      );
      await Restaurant.updateOne(
        { _id: sub.restaurantId },
        { $set: { status: 'active', subscriptionStatus: 'active' } }
      );
      logger.info('Subscription renewed via webhook', { subscriptionId: subId, restaurantId: sub.restaurantId });
    } else if (event === 'subscription.cancelled') {
      const subId = getSubId();
      if (!subId) {
        res.status(200).send('OK');
        return;
      }
      await Subscription.updateOne(
        { razorpaySubscriptionId: subId },
        { $set: { status: 'cancelled' } }
      );
      logger.info('Subscription cancelled via webhook', { subscriptionId: subId });
    } else if (event === 'payment.failed') {
      const subId = getSubId();
      if (!subId) {
        res.status(200).send('OK');
        return;
      }
      const sub = await Subscription.findOne({ razorpaySubscriptionId: subId }).lean();
      if (!sub) {
        res.status(200).send('OK');
        return;
      }
      const graceEnd = new Date();
      graceEnd.setDate(graceEnd.getDate() + GRACE_DAYS);
      await Subscription.updateOne(
        { _id: sub._id },
        { $set: { status: 'past_due', gracePeriodEndsAt: graceEnd } }
      );
      logger.warn('Subscription payment failed, grace period set', {
        subscriptionId: subId,
        restaurantId: sub.restaurantId,
        gracePeriodEndsAt: graceEnd,
      });
    }
  } catch (err: any) {
    logger.error('Razorpay webhook processing error', { event, error: err?.message });
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  res.status(200).send('OK');
}

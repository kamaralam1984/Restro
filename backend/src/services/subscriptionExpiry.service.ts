import mongoose from 'mongoose';
import { Subscription } from '../models/Subscription.model';
import { Restaurant } from '../models/Restaurant.model';
import { User } from '../models/User.model';
import { sendSubscriptionExpiryWarning } from '../utils/email';

const APP_URL = process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

async function getOwnerEmail(restaurantId: mongoose.Types.ObjectId): Promise<string | null> {
  const owner = await User.findOne({
    restaurantId,
    role: 'admin',
  })
    .select('email')
    .lean();
  return owner?.email ?? null;
}

/**
 * Find subscriptions that have passed endDate and are still 'active',
 * mark them expired and set the restaurant to inactive/suspended. Sends expiry email to owner.
 */
export async function processExpiredSubscriptions(): Promise<{ processed: number }> {
  const now = new Date();
  const expired = await Subscription.find({
    status: 'active',
    endDate: { $lt: now },
  }).lean();

  let processed = 0;
  for (const sub of expired) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await Subscription.updateOne(
        { _id: sub._id },
        { $set: { status: 'expired' } },
        { session }
      );
      const rest = await Restaurant.findById(sub.restaurantId).select('name slug').lean();
      await Restaurant.updateOne(
        { _id: sub.restaurantId },
        {
          $set: {
            status: 'inactive',
            subscriptionStatus: 'suspended',
          },
        },
        { session }
      );
      await session.commitTransaction();
      processed++;
      if (rest) {
        const toEmail = await getOwnerEmail(sub.restaurantId as mongoose.Types.ObjectId);
        if (toEmail) {
          await sendSubscriptionExpiryWarning({
            toEmail,
            restaurantName: rest.name,
            storeLink: `${APP_URL.replace(/\/$/, '')}/admin/login`,
          });
        }
      }
    } catch (err) {
      await session.abortTransaction();
      const { logger } = await import('../utils/logger');
      logger.error('Subscription expiry: failed for subscription', { subId: sub._id, err });
    } finally {
      session.endSession();
    }
  }

  // Grace period ended: past_due subscriptions past gracePeriodEndsAt → suspend
  const graceEnded = await Subscription.find({
    status: 'past_due',
    gracePeriodEndsAt: { $lt: now },
  }).lean();

  for (const sub of graceEnded) {
    try {
      await Subscription.updateOne({ _id: sub._id }, { $set: { status: 'expired' } });
      await Restaurant.updateOne(
        { _id: sub.restaurantId },
        { $set: { status: 'inactive', subscriptionStatus: 'suspended' } }
      );
      processed++;
      const rest = await Restaurant.findById(sub.restaurantId).select('name').lean();
      if (rest) {
        const toEmail = await getOwnerEmail(sub.restaurantId as mongoose.Types.ObjectId);
        if (toEmail) {
          await sendSubscriptionExpiryWarning({
            toEmail,
            restaurantName: rest.name,
            storeLink: `${APP_URL.replace(/\/$/, '')}/admin/login`,
          });
        }
      }
    } catch (err) {
      const { logger } = await import('../utils/logger');
      logger.error('Grace period expiry: failed for subscription', { subId: sub._id, err });
    }
  }

  // Trial expiry: restaurants on trial with trialEndsAt in the past
  const trialExpired = await Restaurant.find({
    subscriptionStatus: 'trial',
    trialEndsAt: { $lt: now },
    status: 'active',
  }).lean();

  for (const rest of trialExpired) {
    try {
      await Restaurant.updateOne(
        { _id: rest._id },
        { $set: { status: 'inactive', subscriptionStatus: 'suspended' } }
      );
      processed++;
      const toEmail = await getOwnerEmail(rest._id as mongoose.Types.ObjectId);
      if (toEmail) {
        await sendSubscriptionExpiryWarning({
          toEmail,
          restaurantName: rest.name,
          storeLink: `${APP_URL.replace(/\/$/, '')}/admin/login`,
        });
      }
    } catch (err) {
      const { logger } = await import('../utils/logger');
      logger.error('Trial expiry: failed for restaurant', { restaurantId: rest._id, err });
    }
  }

  return { processed };
}

import mongoose from 'mongoose';
import { Subscription } from '../models/Subscription.model';
import { Restaurant } from '../models/Restaurant.model';

/**
 * Find subscriptions that have passed endDate and are still 'active',
 * mark them expired and set the restaurant to inactive/suspended.
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
    } catch (err) {
      await session.abortTransaction();
      console.error('Subscription expiry: failed for subscription', sub._id, err);
    } finally {
      session.endSession();
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
    } catch (err) {
      console.error('Trial expiry: failed for restaurant', rest._id, err);
    }
  }

  return { processed };
}

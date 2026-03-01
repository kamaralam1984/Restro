import mongoose, { Schema, Document } from 'mongoose';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'past_due';
export type BillingCycle = 'monthly' | 'yearly';

export interface ISubscription extends Document {
  restaurantId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;

  // Pricing snapshot at time of purchase
  amount: number;
  currency: string;

  // Dates
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;

  // Payment info
  paymentMethod: 'cash' | 'online' | 'bank_transfer';
  paymentId?: string;         // Razorpay payment ID (for online)
  invoiceNumber?: string;

  // Renewal
  autoRenew: boolean;
  renewalReminderSent: boolean;

  // Collected by (super admin who registered this)
  collectedBy?: mongoose.Types.ObjectId;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'RentalPlan',
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'past_due'],
      default: 'active',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextBillingDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'bank_transfer'],
      required: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true, // allow null for multiple docs
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    renewalReminderSent: {
      type: Boolean,
      default: false,
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ restaurantId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });
SubscriptionSchema.index({ endDate: 1 });

// Auto-generate invoice number before saving
SubscriptionSchema.pre('save', async function (next) {
  if (!this.invoiceNumber && this.isNew) {
    const count = await mongoose.model('Subscription').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

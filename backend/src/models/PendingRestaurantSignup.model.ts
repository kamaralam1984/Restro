import mongoose, { Schema, Document } from 'mongoose';

export type PendingSignupStatus = 'pending' | 'completed' | 'cancelled' | 'expired';

export interface IPendingRestaurantSignup extends Document {
  name: string;
  slug: string;
  email: string;
  adminPasswordHash: string;
  adminName?: string;
  adminPhone?: string;
  planId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  status: PendingSignupStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PendingRestaurantSignupSchema = new Schema<IPendingRestaurantSignup>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    email: { type: String, required: true },
    adminPasswordHash: { type: String, required: true },
    adminName: { type: String },
    adminPhone: { type: String },
    planId: { type: Schema.Types.ObjectId, ref: 'RentalPlan', required: true },
    razorpayOrderId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire pending signups after 1 day
PendingRestaurantSignupSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 }
);
PendingRestaurantSignupSchema.index({ razorpayOrderId: 1 });

export const PendingRestaurantSignup = mongoose.model<IPendingRestaurantSignup>(
  'PendingRestaurantSignup',
  PendingRestaurantSignupSchema
);


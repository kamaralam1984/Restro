import mongoose, { Schema, Document } from 'mongoose';

// ─── Referral Code ────────────────────────────────────────────────────────────

export interface IReferralCode extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  code: string;
  usageCount: number;
  maxUsage: number;        // -1 = unlimited
  rewardPerReferral: number;
  isActive: boolean;
  createdAt: Date;
}

const ReferralCodeSchema = new Schema<IReferralCode>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsage: {
      type: Number,
      default: -1, // -1 = unlimited
    },
    rewardPerReferral: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ReferralCodeSchema.index({ userId: 1, restaurantId: 1 });
ReferralCodeSchema.index({ code: 1 }, { unique: true });

export const ReferralCode = mongoose.model<IReferralCode>('ReferralCode', ReferralCodeSchema);

// ─── Referral Use ─────────────────────────────────────────────────────────────

export type ReferralStatus = 'pending' | 'rewarded';

export interface IReferralUse extends Document {
  referralCodeId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  status: ReferralStatus;
  rewardAmount: number;
  createdAt: Date;
}

const ReferralUseSchema = new Schema<IReferralUse>(
  {
    referralCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'ReferralCode',
      required: true,
    },
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'rewarded'],
      default: 'pending',
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ReferralUseSchema.index({ referredUserId: 1, restaurantId: 1 }, { unique: true });
ReferralUseSchema.index({ referrerId: 1, restaurantId: 1 });
ReferralUseSchema.index({ referralCodeId: 1 });

export const ReferralUse = mongoose.model<IReferralUse>('ReferralUse', ReferralUseSchema);

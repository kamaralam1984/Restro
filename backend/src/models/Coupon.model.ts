import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  restaurantId: mongoose.Types.ObjectId;
  code: string;
  type: 'percentage' | 'flat' | 'free_delivery';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'flat', 'free_delivery'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      required: true,
      default: -1, // -1 = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique code per restaurant
CouponSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

// Index for date-range queries
CouponSchema.index({ validFrom: 1, validUntil: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;

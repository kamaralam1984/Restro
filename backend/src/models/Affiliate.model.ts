import mongoose, { Schema, Document } from 'mongoose';

// ── Affiliate ─────────────────────────────────────────────────────────────────

export interface IAffiliate extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  code: string;
  commissionType: 'percentage' | 'flat';
  commissionValue: number;
  totalEarned: number;
  totalOrders: number;
  status: 'active' | 'inactive' | 'pending';
  payoutMethod: string;
  payoutDetails: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateSchema = new Schema<IAffiliate>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    commissionType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
      default: 'percentage',
    },
    commissionValue: { type: Number, required: true, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    totalOrders: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
      index: true,
    },
    payoutMethod: { type: String, required: true, trim: true },
    payoutDetails: { type: String, required: true, trim: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Unique code per restaurant
AffiliateSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

export const Affiliate = mongoose.model<IAffiliate>('Affiliate', AffiliateSchema);

// ── Affiliate Conversion ──────────────────────────────────────────────────────

export interface IAffiliateConversion extends Document {
  restaurantId: mongoose.Types.ObjectId;
  affiliateId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  orderAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date;
}

const AffiliateConversionSchema = new Schema<IAffiliateConversion>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderAmount: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AffiliateConversionSchema.index({ restaurantId: 1, affiliateId: 1 });
AffiliateConversionSchema.index({ restaurantId: 1, status: 1 });

export const AffiliateConversion = mongoose.model<IAffiliateConversion>(
  'AffiliateConversion',
  AffiliateConversionSchema
);

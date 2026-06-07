import mongoose, { Schema, Document } from 'mongoose';

export interface IFranchisee extends Document {
  parentRestaurantId: mongoose.Types.ObjectId;
  franchiseeName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  city: string;
  address: string;
  status: 'prospect' | 'onboarding' | 'active' | 'terminated';
  royaltyType: 'percentage' | 'flat';
  royaltyValue: number;
  contractStartDate?: Date;
  contractEndDate?: Date;
  totalRevenue: number;
  royaltyPaid: number;
  royaltyDue: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoyaltyPayment extends Document {
  franchiseeId: mongoose.Types.ObjectId;
  parentRestaurantId: mongoose.Types.ObjectId;
  amount: number;
  periodMonth: string; // YYYY-MM
  status: 'pending' | 'paid';
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
}

const FranchiseeSchema = new Schema<IFranchisee>(
  {
    parentRestaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    franchiseeName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerPhone: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['prospect', 'onboarding', 'active', 'terminated'],
      default: 'prospect',
    },
    royaltyType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
    },
    royaltyValue: { type: Number, required: true, default: 0 },
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    totalRevenue: { type: Number, default: 0 },
    royaltyPaid: { type: Number, default: 0 },
    royaltyDue: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

FranchiseeSchema.index({ parentRestaurantId: 1 });
FranchiseeSchema.index({ status: 1 });
FranchiseeSchema.index({ city: 1 });

const RoyaltyPaymentSchema = new Schema<IRoyaltyPayment>(
  {
    franchiseeId: {
      type: Schema.Types.ObjectId,
      ref: 'Franchisee',
      required: true,
    },
    parentRestaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    amount: { type: Number, required: true },
    periodMonth: { type: String, required: true }, // YYYY-MM
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

RoyaltyPaymentSchema.index({ franchiseeId: 1, periodMonth: 1 });
RoyaltyPaymentSchema.index({ parentRestaurantId: 1, status: 1 });
RoyaltyPaymentSchema.index({ periodMonth: 1 });

export const Franchisee = mongoose.model<IFranchisee>('Franchisee', FranchiseeSchema);
export const RoyaltyPayment = mongoose.model<IRoyaltyPayment>('RoyaltyPayment', RoyaltyPaymentSchema);

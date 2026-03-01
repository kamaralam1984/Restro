import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanFeatures {
  maxMenuItems: number;       // -1 = unlimited
  maxStaff: number;           // -1 = unlimited
  maxTables: number;          // -1 = unlimited
  onlineOrdering: boolean;
  tableBooking: boolean;     // Pro+
  billing: boolean;           // Pro+
  analytics: boolean;        // Premium
  staffControl: boolean;     // Premium: manage staff
  customDomain: boolean;
  whatsappIntegration: boolean;
  razorpayIntegration: boolean;
  emailSupport: boolean;
}

export interface IRentalPlan extends Document {
  name: string;                    // e.g. "Starter", "Pro", "Enterprise"
  description?: string;
  price: number;                   // Monthly price in INR
  yearlyPrice?: number;            // Discounted yearly price
  billingCycle: 'monthly' | 'yearly' | 'both';
  features: IPlanFeatures;
  trialDays: number;               // Free trial days (0 = no trial)
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanFeaturesSchema = new Schema<IPlanFeatures>(
  {
    maxMenuItems: { type: Number, default: 50 },
    maxStaff: { type: Number, default: 3 },
    maxTables: { type: Number, default: 10 },
    onlineOrdering: { type: Boolean, default: true },
    tableBooking: { type: Boolean, default: false },
    billing: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    staffControl: { type: Boolean, default: false },
    customDomain: { type: Boolean, default: false },
    whatsappIntegration: { type: Boolean, default: false },
    razorpayIntegration: { type: Boolean, default: false },
    emailSupport: { type: Boolean, default: true },
  },
  { _id: false }
);

const RentalPlanSchema = new Schema<IRentalPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    yearlyPrice: {
      type: Number,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'both'],
      default: 'both',
    },
    features: {
      type: PlanFeaturesSchema,
      required: true,
    },
    trialDays: {
      type: Number,
      default: 14,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

RentalPlanSchema.index({ isActive: 1, sortOrder: 1 });

export const RentalPlan = mongoose.model<IRentalPlan>('RentalPlan', RentalPlanSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  parentRestaurantId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  managerName?: string;
  managerPhone?: string;
  status: 'active' | 'inactive' | 'setup';
  monthlyRevenue: number;
  totalOrders: number;
  avgRating: number;
  openingTime: string;
  closingTime: string;
  features: {
    onlineOrdering: boolean;
    tableBooking: boolean;
    delivery: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IBranchMetric extends Document {
  branchId: mongoose.Types.ObjectId;
  parentRestaurantId: mongoose.Types.ObjectId;
  date: Date;
  orders: number;
  revenue: number;
  avgOrderValue: number;
  newCustomers: number;
  createdAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    parentRestaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    managerName: { type: String, trim: true },
    managerPhone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'setup'],
      default: 'setup',
    },
    monthlyRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    openingTime: { type: String, required: true, default: '09:00' },
    closingTime: { type: String, required: true, default: '22:00' },
    features: {
      type: new Schema(
        {
          onlineOrdering: { type: Boolean, default: false },
          tableBooking: { type: Boolean, default: false },
          delivery: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: () => ({}),
    },
  },
  { timestamps: true }
);

BranchSchema.index({ parentRestaurantId: 1 });
BranchSchema.index({ status: 1 });
BranchSchema.index({ city: 1 });

const BranchMetricSchema = new Schema<IBranchMetric>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    parentRestaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    date: { type: Date, required: true },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BranchMetricSchema.index({ branchId: 1, date: -1 });
BranchMetricSchema.index({ parentRestaurantId: 1, date: -1 });

export const Branch = mongoose.model<IBranch>('Branch', BranchSchema);
export const BranchMetric = mongoose.model<IBranchMetric>('BranchMetric', BranchMetricSchema);

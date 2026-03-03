import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

export interface IRestaurantFeatures {
  onlineOrdering: boolean;
  tableBooking: boolean;
  billing: boolean;
  onlinePayments: boolean;
  reviews: boolean;
  heroImages: boolean;
  whatsappNotifications: boolean;
  analytics: boolean;
  staffControl: boolean;
  menuManagement: boolean;
}

export interface IRestaurant extends Document {
  name: string;
  slug: string; // unique identifier used in URLs / tenant resolution
  logo?: string;
  description?: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;

  // Region / locale (e.g. IN, AE for UAE mode: AED, 5% VAT)
  region?: string;

  // Multi-branch: optional parent restaurant ID (this outlet is a branch)
  parentRestaurantId?: mongoose.Types.ObjectId;

  // Branding
  primaryColor: string;
  theme?: string; // theme id for website design (e.g. default, ocean, sunset)
  currency: string;

  // Per-restaurant email SMTP config
  emailConfig?: IEmailConfig;

  // Contact email for notifications / receipts
  notificationEmail?: string;

  // Per-restaurant Razorpay keys
  razorpayKeyId?: string;
  razorpayKeySecret?: string;

  // WhatsApp integration
  whatsappNumber?: string;
  whatsappApiUrl?: string;
  whatsappApiKey?: string;

  // Tax & charges
  taxRate: number;
  serviceCharge: number;

  // Subscription / rental
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled';
  trialEndsAt?: Date;
  currentPlanId?: mongoose.Types.ObjectId;

  // Owner (restaurant admin user)
  ownerId?: mongoose.Types.ObjectId;

  status: 'active' | 'suspended' | 'inactive';

  // Super admin feature controls per restaurant
  features: IRestaurantFeatures;

  /** Which sections each staff role can access in the staff panel (admin has full access) */
  rolePermissions?: IRolePermissions;
  createdAt: Date;
  updatedAt: Date;
}

/** Permission keys for staff panel sections (dashboard, orders, menu, etc.) */
export type StaffPermissionKey =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'bookings'
  | 'heroImages'
  | 'billing'
  | 'payments'
  | 'revenue'
  | 'customers'
  | 'reviews'
  | 'analytics';

export interface IRolePermissions {
  staff?: StaffPermissionKey[];
  manager?: StaffPermissionKey[];
  cashier?: StaffPermissionKey[];
}

const EmailConfigSchema = new Schema<IEmailConfig>(
  {
    host: { type: String, trim: true },
    port: { type: Number, default: 587 },
    secure: { type: Boolean, default: false },
    user: { type: String, trim: true },
    password: { type: String },
    fromName: { type: String, trim: true },
    fromEmail: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    logo: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    pincode: { type: String, trim: true },
    region: { type: String, trim: true },
    parentRestaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },

    primaryColor: {
      type: String,
      default: '#ea580c',
    },
    theme: {
      type: String,
      trim: true,
      default: 'default',
    },
    currency: {
      type: String,
      default: 'INR',
    },

    emailConfig: {
      type: EmailConfigSchema,
    },

    notificationEmail: { type: String, trim: true, lowercase: true },

    razorpayKeyId: { type: String, trim: true },
    razorpayKeySecret: { type: String },

    whatsappNumber: { type: String, trim: true },
    whatsappApiUrl: { type: String, trim: true },
    whatsappApiKey: { type: String },

    taxRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'suspended', 'cancelled'],
      default: 'trial',
    },
    trialEndsAt: {
      type: Date,
    },
    currentPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'RentalPlan',
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
    },

    features: {
      type: new Schema({
        onlineOrdering:          { type: Boolean, default: true },
        tableBooking:            { type: Boolean, default: true },
        billing:                 { type: Boolean, default: true },
        onlinePayments:          { type: Boolean, default: true },
        reviews:                 { type: Boolean, default: true },
        heroImages:              { type: Boolean, default: true },
        whatsappNotifications:   { type: Boolean, default: false },
        analytics:               { type: Boolean, default: true },
        staffControl:            { type: Boolean, default: false },
        menuManagement:          { type: Boolean, default: true },
      }, { _id: false }),
      default: () => ({}),
    },
    rolePermissions: {
      type: new Schema({
        staff:   { type: [String], default: ['dashboard', 'orders'] },
        manager: { type: [String], default: ['dashboard', 'orders', 'menu', 'bookings', 'customers', 'reviews', 'analytics'] },
        cashier: { type: [String], default: ['dashboard', 'orders', 'billing', 'revenue'] },
      }, { _id: false }),
    },
  },
  {
    timestamps: true,
  }
);

RestaurantSchema.index({ slug: 1 });
RestaurantSchema.index({ status: 1 });
RestaurantSchema.index({ subscriptionStatus: 1 });
RestaurantSchema.index({ ownerId: 1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

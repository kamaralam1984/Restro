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
  onlinePayments: boolean;
  reviews: boolean;
  heroImages: boolean;
  whatsappNotifications: boolean;
  analytics: boolean;
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

  // Branding
  primaryColor: string;
  currency: string;

  // Per-restaurant email SMTP config
  emailConfig?: IEmailConfig;

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

  createdAt: Date;
  updatedAt: Date;
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

    primaryColor: {
      type: String,
      default: '#ea580c', // orange-600
    },
    currency: {
      type: String,
      default: 'INR',
    },

    emailConfig: {
      type: EmailConfigSchema,
    },

    razorpayKeyId: { type: String, trim: true },
    razorpayKeySecret: { type: String },

    whatsappNumber: { type: String, trim: true },
    whatsappApiUrl: { type: String, trim: true },
    whatsappApiKey: { type: String },

    taxRate: {
      type: Number,
      default: 18,
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
        onlinePayments:          { type: Boolean, default: true },
        reviews:                 { type: Boolean, default: true },
        heroImages:              { type: Boolean, default: true },
        whatsappNotifications:   { type: Boolean, default: false },
        analytics:               { type: Boolean, default: true },
        menuManagement:          { type: Boolean, default: true },
      }, { _id: false }),
      default: () => ({}),
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

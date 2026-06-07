import mongoose, { Schema, Document } from 'mongoose';

// ─── Lead ────────────────────────────────────────────────────────────────────

export interface ILead extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  source: 'walk-in' | 'online' | 'referral' | 'social' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  followUpDate?: Date;
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    source: {
      type: String,
      enum: ['walk-in', 'online', 'referral', 'social', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
    },
    notes: { type: String, default: '' },
    followUpDate: { type: Date },
    assignedTo: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

LeadSchema.index({ restaurantId: 1, status: 1 });
LeadSchema.index({ restaurantId: 1, source: 1 });
LeadSchema.index({ restaurantId: 1, followUpDate: 1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);

// ─── Campaign ────────────────────────────────────────────────────────────────

export interface ICampaign extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  type: 'whatsapp' | 'sms' | 'email' | 'push';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  targetSegment: 'all' | 'new' | 'returning' | 'inactive' | 'vip';
  message: string;
  subject?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['whatsapp', 'sms', 'email', 'push'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'failed'],
      default: 'draft',
    },
    targetSegment: {
      type: String,
      enum: ['all', 'new', 'returning', 'inactive', 'vip'],
      default: 'all',
    },
    message: { type: String, required: true },
    subject: { type: String },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    recipientCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CampaignSchema.index({ restaurantId: 1, status: 1 });
CampaignSchema.index({ restaurantId: 1, type: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);

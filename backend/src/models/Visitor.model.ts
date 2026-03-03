import mongoose, { Schema, Document } from 'mongoose';

export interface IPageView {
  path: string;
  visits: number;
  totalDurationSec: number;
  lastVisitedAt: Date;
}

export interface IVisitor extends Document {
  sessionId: string;
  name?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  userAgent?: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  totalDurationSec: number;
  pageViews: IPageView[];
  autoInfoEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    path: { type: String, required: true, trim: true },
    visits: { type: Number, default: 1 },
    totalDurationSec: { type: Number, default: 0 },
    lastVisitedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const VisitorSchema = new Schema<IVisitor>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    medium: {
      type: String,
      trim: true,
    },
    campaign: {
      type: String,
      trim: true,
    },
    referrer: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    firstSeenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalDurationSec: {
      type: Number,
      default: 0,
      min: 0,
    },
    pageViews: {
      type: [PageViewSchema],
      default: [],
    },
    autoInfoEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

VisitorSchema.index({ lastSeenAt: -1 });
VisitorSchema.index({ country: 1, state: 1, city: 1 });

export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);


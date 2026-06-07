import mongoose, { Schema, Document } from 'mongoose';

// ── Reseller Client Sub-document ──────────────────────────────────────────────

export interface IResellerClient {
  name: string;
  email: string;
  plan: string;
  status: string;
  addedAt: Date;
}

// ── WhiteLabel Interface ───────────────────────────────────────────────────────

export interface IWhiteLabel extends Document {
  restaurantId: mongoose.Types.ObjectId;
  agencyName: string;
  customDomain?: string;
  brandColor: string;
  brandColorSecondary: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCSS?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  customLoginMessage?: string;
  hideRestroOSBranding: boolean;
  status: 'active' | 'inactive';
  resellerClients: IResellerClient[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const ResellerClientSchema = new Schema<IResellerClient>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    plan: { type: String, required: true, trim: true },
    status: { type: String, default: 'active', trim: true },
    addedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const WhiteLabelSchema = new Schema<IWhiteLabel>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      unique: true,
      index: true,
    },
    agencyName: { type: String, required: true, trim: true, default: 'My Agency' },
    customDomain: { type: String, trim: true },
    brandColor: { type: String, default: '#c8972a', trim: true },
    brandColorSecondary: { type: String, default: '#080808', trim: true },
    logoUrl: { type: String, trim: true },
    faviconUrl: { type: String, trim: true },
    customCSS: { type: String },
    emailFromName: { type: String, trim: true },
    emailFromAddress: { type: String, trim: true, lowercase: true },
    smtpHost: { type: String, trim: true },
    smtpPort: { type: Number, min: 1, max: 65535 },
    smtpUser: { type: String, trim: true },
    smtpPass: { type: String },
    customLoginMessage: { type: String },
    hideRestroOSBranding: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    resellerClients: { type: [ResellerClientSchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'whitelabels',
  }
);

const WhiteLabel = mongoose.model<IWhiteLabel>('WhiteLabel', WhiteLabelSchema);

export default WhiteLabel;

import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  itemId: mongoose.Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
}

export interface IAbandonedCart extends Document {
  restaurantId: mongoose.Types.ObjectId;
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
  items: ICartItem[];
  cartTotal: number;
  tableNumber?: string;
  slug: string;
  status: 'pending' | 'reminder_sent' | 'recovered' | 'ignored';
  reminderSentAt?: Date;
  reminderCount: number;
  recoveredAt?: Date;
  source: 'qr_order' | 'online' | 'pos';
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    itemId: { type: Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AbandonedCartSchema = new Schema<IAbandonedCart>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    customerName: { type: String },
    items: { type: [CartItemSchema], required: true, default: [] },
    cartTotal: { type: Number, required: true, min: 0 },
    tableNumber: { type: String },
    slug: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'reminder_sent', 'recovered', 'ignored'],
      default: 'pending',
      index: true,
    },
    reminderSentAt: { type: Date },
    reminderCount: { type: Number, default: 0, min: 0 },
    recoveredAt: { type: Date },
    source: {
      type: String,
      enum: ['qr_order', 'online', 'pos'],
      required: true,
      default: 'qr_order',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for restaurant + status queries
AbandonedCartSchema.index({ restaurantId: 1, status: 1 });
AbandonedCartSchema.index({ restaurantId: 1, createdAt: -1 });

export default mongoose.model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);

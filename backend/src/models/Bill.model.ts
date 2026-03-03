import mongoose, { Schema, Document } from 'mongoose';

export interface IBillItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export type BillSource = 'online' | 'offline';

export interface IBill extends Document {
  restaurantId: mongoose.Types.ObjectId;
  billNumber: string;
  source: BillSource;
  orderId?: mongoose.Types.ObjectId;
  orderNumber?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: IBillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'unpaid' | 'paid' | 'cancelled';
  notes?: string;
  generatedBy: mongoose.Types.ObjectId; // staff / admin user id
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new Schema<IBillItem>({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const BillSchema = new Schema<IBill>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    billNumber: {
      type: String,
      unique: true,
    },
    source: {
      type: String,
      enum: ['online', 'offline'],
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    orderNumber: { type: String },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
    items: { type: [BillItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0, default: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    deliveryCharge: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      required: true,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'cancelled'],
      default: 'unpaid',
    },
    notes: { type: String, trim: true },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

BillSchema.index({ restaurantId: 1, createdAt: -1 });
BillSchema.index({ restaurantId: 1, source: 1, createdAt: -1 });
BillSchema.index({ restaurantId: 1, status: 1 });
BillSchema.index({ billNumber: 1 });

BillSchema.pre('save', async function (next) {
  if (!this.billNumber) {
    const count = await mongoose.model<IBill>('Bill').countDocuments({ restaurantId: this.restaurantId });
    this.billNumber = `BILL-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export const Bill = mongoose.model<IBill>('Bill', BillSchema);

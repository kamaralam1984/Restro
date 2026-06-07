import mongoose, { Schema, Document } from 'mongoose';

// ─── Ingredient ───────────────────────────────────────────────────────────────

export interface IIngredient extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs';
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  category: string;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'L', 'ml', 'pcs'],
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    costPerUnit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

IngredientSchema.index({ restaurantId: 1, name: 1 });
IngredientSchema.index({ restaurantId: 1, isActive: 1 });

// ─── Vendor ───────────────────────────────────────────────────────────────────

export interface IVendor extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
    },
    paymentTerms: {
      type: String,
      required: true,
      trim: true,
      default: 'Net 30',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

VendorSchema.index({ restaurantId: 1, isActive: 1 });

// ─── Purchase Order ───────────────────────────────────────────────────────────

export interface IPurchaseOrderItem {
  ingredientId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  items: IPurchaseOrderItem[];
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  totalAmount: number;
  orderedAt?: Date;
  receivedAt?: Date;
  notes?: string;
  createdAt: Date;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    items: {
      type: [PurchaseOrderItemSchema],
      required: true,
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'ordered', 'received', 'cancelled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    orderedAt: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PurchaseOrderSchema.index({ restaurantId: 1, status: 1 });
PurchaseOrderSchema.index({ restaurantId: 1, vendorId: 1 });

// ─── Exports ──────────────────────────────────────────────────────────────────

export const Ingredient = mongoose.model<IIngredient>('Ingredient', IngredientSchema);
export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

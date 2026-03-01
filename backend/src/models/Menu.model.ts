import mongoose, { Schema, Document } from 'mongoose';

export interface IAddOn {
  name: string;
  price: number;
  available: boolean;
}

export interface IMenu extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  isVeg: boolean;
  ingredients?: string[];
  allergens?: string[];
  preparationTime?: number; // in minutes
  addOns?: IAddOn[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    available: {
      type: Boolean,
      default: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
      required: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    preparationTime: {
      type: Number,
      min: 0,
    },
    addOns: {
      type: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true, min: 0 },
          available: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// All queries are tenant-scoped; soft delete filter applied in controllers
MenuSchema.index({ restaurantId: 1, category: 1, available: 1 });
MenuSchema.index({ restaurantId: 1, isDeleted: 1 });
MenuSchema.index({ restaurantId: 1, isVeg: 1, available: 1 });
MenuSchema.index({ restaurantId: 1, available: 1 });

export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);

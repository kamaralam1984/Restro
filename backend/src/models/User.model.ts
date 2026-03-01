import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'cashier' | 'customer';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  // null for super_admin; required for all restaurant-level users
  restaurantId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager', 'staff', 'cashier', 'customer'],
      default: 'customer',
    },
    password: {
      type: String,
      select: false,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
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

// Unique email per restaurant (super_admin has null restaurantId)
UserSchema.index({ email: 1, restaurantId: 1 }, { unique: true });
UserSchema.index({ restaurantId: 1, role: 1 });
UserSchema.index({ restaurantId: 1, phone: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);

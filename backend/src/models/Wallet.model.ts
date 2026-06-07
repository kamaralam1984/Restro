import mongoose, { Schema, Document } from 'mongoose';

// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
  },
  { timestamps: true }
);

WalletSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);

// ─── Wallet Transaction ───────────────────────────────────────────────────────

export type WalletTransactionType = 'credit' | 'debit';
export type WalletTransactionSource =
  | 'cashback'
  | 'refund'
  | 'referral'
  | 'gift'
  | 'topup'
  | 'order_payment'
  | 'admin_adjustment';

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  type: WalletTransactionType;
  amount: number;
  source: WalletTransactionSource;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  referenceId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ['cashback', 'refund', 'referral', 'gift', 'topup', 'order_payment', 'admin_adjustment'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    referenceId: {
      type: String,
      trim: true,
      required: false,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ userId: 1, restaurantId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model<IWalletTransaction>(
  'WalletTransaction',
  WalletTransactionSchema
);

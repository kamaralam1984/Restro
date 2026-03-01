import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  restaurantId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment?: string;
  menuItemId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    menuItemId: { type: Schema.Types.ObjectId, ref: 'Menu' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ restaurantId: 1, createdAt: -1 });
ReviewSchema.index({ restaurantId: 1, rating: 1 });
ReviewSchema.index({ restaurantId: 1, menuItemId: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroImage extends Document {
  restaurantId: mongoose.Types.ObjectId;
  imageUrl: string;
  order: number; // 1-5 for ordering
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroImageSchema = new Schema<IHeroImage>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Order unique per restaurant
HeroImageSchema.index({ restaurantId: 1, order: 1 }, { unique: true });
HeroImageSchema.index({ restaurantId: 1, isActive: 1 });

export const HeroImage = mongoose.model<IHeroImage>('HeroImage', HeroImageSchema);

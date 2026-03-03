import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'booked' | 'reserved' | 'maintenance';
  location: {
    row: number;
    column: number;
    section: string; // 'window', 'center', 'corner', 'outdoor'
  };
  /** Per-table booking rate (₹/hour). If set, overrides default-by-capacity. */
  hourlyRate?: number;
  /** Offer: order total reaching this amount (₹) makes customer eligible for discountAmount. */
  discountThreshold?: number;
  /** Offer: discount amount (₹) when order reaches discountThreshold (e.g. 1 hour free). */
  discountAmount?: number;
  currentBooking?: mongoose.Types.ObjectId;
  bookedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 2,
      max: 20,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'reserved', 'maintenance'],
      default: 'available',
    },
    location: {
      row: { type: Number, required: true, min: 1, max: 20 },
      column: { type: Number, required: true, min: 1, max: 20 },
      section: {
        type: String,
        enum: ['window', 'center', 'corner', 'outdoor'],
        default: 'center',
      },
    },
    hourlyRate: { type: Number, min: 0 },
    discountThreshold: { type: Number, min: 0 },
    discountAmount: { type: Number, min: 0 },
    currentBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    bookedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// tableNumber unique per restaurant
TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
TableSchema.index({ restaurantId: 1, status: 1 });
TableSchema.index({ restaurantId: 1, 'location.row': 1, 'location.column': 1 });

export const Table = mongoose.model<ITable>('Table', TableSchema);

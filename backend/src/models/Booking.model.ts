import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  restaurantId: mongoose.Types.ObjectId;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: Date;
  time: string;
  endTime?: string;
  bookingHours: number;
  numberOfGuests: number;
  tableNumber?: string;
  tableCapacity?: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  advancePayment: number;
  totalBookingAmount: number;
  advancePaymentStatus: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  discountApplied: boolean;
  orderTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    bookingNumber: {
      type: String,
      unique: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    endTime: { type: String, trim: true },
    bookingHours: { type: Number, required: true, min: 1, max: 12, default: 1 },
    numberOfGuests: { type: Number, required: true, min: 1, max: 50 },
    tableNumber: { type: String, trim: true },
    tableCapacity: { type: Number, min: 2 },
    specialRequests: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    advancePayment: { type: Number, default: 0, min: 0 },
    totalBookingAmount: { type: Number, required: true, min: 0 },
    advancePaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentId: { type: String, trim: true },
    discountApplied: { type: Boolean, default: false },
    orderTotal: { type: Number, min: 0 },
  },
  { timestamps: true }
);

BookingSchema.index({ restaurantId: 1, date: 1, time: 1 });
BookingSchema.index({ restaurantId: 1, status: 1, date: 1 });
BookingSchema.index({ restaurantId: 1, customerPhone: 1 });
BookingSchema.index({ bookingNumber: 1 });

BookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    const count = await mongoose.model('Booking').countDocuments({ restaurantId: this.restaurantId });
    this.bookingNumber = `BK-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

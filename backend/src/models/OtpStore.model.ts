import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpStore extends Document {
  email: string;
  otp: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

const OtpStoreSchema = new Schema<IOtpStore>({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
});

export const OtpStore = mongoose.model<IOtpStore>('OtpStore', OtpStoreSchema);

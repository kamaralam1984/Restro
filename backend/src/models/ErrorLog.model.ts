import mongoose, { Schema, Document } from 'mongoose';

export type ErrorStatus = 'open' | 'investigating' | 'resolved';

export interface IErrorLog extends Document {
  level: 'error' | 'warn';
  message: string;
  statusCode?: number;
  route?: string;
  method?: string;
  userId?: mongoose.Types.ObjectId | null;
  restaurantId?: mongoose.Types.ObjectId | null;
  stack?: string;
  meta?: Record<string, unknown>;
  status: ErrorStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ErrorLogSchema = new Schema<IErrorLog>(
  {
    level: {
      type: String,
      enum: ['error', 'warn'],
      default: 'error',
    },
    message: { type: String, required: true },
    statusCode: { type: Number },
    route: { type: String },
    method: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    stack: { type: String },
    meta: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

ErrorLogSchema.index({ createdAt: -1 });
ErrorLogSchema.index({ status: 1, createdAt: -1 });
ErrorLogSchema.index({ restaurantId: 1, createdAt: -1 });

export const ErrorLog = mongoose.model<IErrorLog>('ErrorLog', ErrorLogSchema);

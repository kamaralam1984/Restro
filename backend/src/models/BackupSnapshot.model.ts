import mongoose, { Schema, Document } from 'mongoose';

export interface IBackupSnapshot extends Document {
  scope: 'all' | 'restaurant';
  restaurantId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  expiresAt: Date;
  payload: any;
}

const BackupSnapshotSchema = new Schema<IBackupSnapshot>(
  {
    scope: {
      type: String,
      enum: ['all', 'restaurant'],
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL index to auto-remove backups after expiresAt
BackupSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
BackupSnapshotSchema.index({ scope: 1, restaurantId: 1, createdAt: -1 });

export const BackupSnapshot = mongoose.model<IBackupSnapshot>('BackupSnapshot', BackupSnapshotSchema);


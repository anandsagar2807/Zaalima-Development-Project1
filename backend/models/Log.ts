import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  user_id: mongoose.Types.ObjectId;
  level: 'info' | 'warn' | 'error';
  event: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

const LogSchema: Schema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: String,
      enum: ['info', 'warn', 'error'],
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

export const Log = mongoose.model<ILog>('Log', LogSchema);

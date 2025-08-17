import { Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'userType', // Dynamically reference model
    },
    userType: {
      type: String,
      required: true,
      enum: ['User', 'Admin'], // Must match actual model names
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['welcome', 'profile', 'payment', 'admin', 'custom'],
      default: 'custom',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification = model('Notification', notificationSchema);

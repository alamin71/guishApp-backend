import { Schema, model } from 'mongoose';
import { ISubscription } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription>(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    price: { type: Number, required: true },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    features: [{ type: String, required: true }],
  },
  { timestamps: true },
);

export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema,
);

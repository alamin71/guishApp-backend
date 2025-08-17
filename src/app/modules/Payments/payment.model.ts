import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    invoiceId: { type: String },
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending'],
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>('Payment', paymentSchema);

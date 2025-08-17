import { Types } from 'mongoose';
import { TUser } from '../user/user.interface';

export interface IPayment {
  user: Types.ObjectId | TUser;
  subscriptionId: Types.ObjectId;
  amount: number;
  transactionId: string;
  invoiceId?: string;
  status: 'succeeded' | 'failed' | 'pending';
  paymentDate?: Date;
}

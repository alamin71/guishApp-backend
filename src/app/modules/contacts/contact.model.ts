// src/modules/contact/contact.model.ts
import mongoose, { Schema, Types } from 'mongoose';
import { IContact } from './contact.interface';

const ContactSchema = new Schema<IContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    isAppUser: { type: Boolean, default: false },
    categories: [{ type: String }],
   ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IContact>('Contact', ContactSchema);

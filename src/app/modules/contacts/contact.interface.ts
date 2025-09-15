// src/modules/contact/contact.interface.ts
import { Document, Types } from 'mongoose';

export interface IContact extends Document {
  userId?: string; // app user id if exists
  name: string;
  phone?: string;
  email?: string;
  isAppUser: boolean;
  categories?: string[];
  ownerId: Types.ObjectId | string; // logged-in user who imported
  createdAt?: Date;
}

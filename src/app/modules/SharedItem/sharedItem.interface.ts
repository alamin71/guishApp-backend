import { Document, Types } from 'mongoose';

export interface ISharedItem extends Document {
  title: string;
  url: string;
  type: 'video' | 'link' | 'file';
  sharedBy: Types.ObjectId;
  category: Types.ObjectId;
}

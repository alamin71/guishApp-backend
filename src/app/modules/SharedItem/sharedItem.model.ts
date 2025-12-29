import { Schema, model } from 'mongoose';
import { ISharedItem } from './sharedItem.interface';

const sharedItemSchema = new Schema<ISharedItem>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['video', 'link', 'file'], default: 'link' },
    sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true },
);

export default model<ISharedItem>('SharedItem', sharedItemSchema);

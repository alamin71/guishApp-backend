import { Schema, model, Types } from 'mongoose';

const sharedItemSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String,  default: 'link' },
    sharedBy: { type: Types.ObjectId, ref: 'User', required: true },
    category: { type: Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true }
);

export default model('SharedItem', sharedItemSchema);

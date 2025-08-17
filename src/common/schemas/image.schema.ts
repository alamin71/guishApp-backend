import { Schema } from 'mongoose';
import { Iimage } from '../../app/interface/common';

export const ImageSchema = new Schema<Iimage>({
  id: { type: String, required: true },
  url: { type: String, required: true },
});

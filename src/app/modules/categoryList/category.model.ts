import { model, Schema, Types } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface';

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categoryImages: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',  
      required: true,
    },
  },
  
  { timestamps: true },
);

const Category = model<ICategory, CategoryModel>('Category', categorySchema);

export default Category;

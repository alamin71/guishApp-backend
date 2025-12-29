import { model, Schema, Types } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface';

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    categoryName: {
      type: String,
      required: true,
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

// ✅ প্রতি user এর মধ্যে categoryName unique হবে
categorySchema.index({ createdBy: 1, categoryName: 1 }, { unique: true });

const Category = model<ICategory, CategoryModel>('Category', categorySchema);

export default Category;

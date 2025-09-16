import { Document, Model, Types } from 'mongoose';

export interface ICategoryImage {
  id: string;
  url: string;
}

export interface ICategory extends Document {
  categoryName: string;
  categoryImages: ICategoryImage[];
  createdBy: Types.ObjectId;
}

export type CategoryModel = Model<ICategory>;

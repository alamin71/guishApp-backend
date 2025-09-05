import { Document, Model } from 'mongoose';

export interface ICategoryImage {
  id: string;
  url: string;
}

export interface ICategory extends Document {
  categoryName: string;
  categoryImages: ICategoryImage[];
}

export type CategoryModel = Model<ICategory>;

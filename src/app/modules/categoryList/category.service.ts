// import Category from './category.model';
// import { ICategory } from './category.interface';

// const createCategory = async (payload: Partial<ICategory>) => {
//   return await Category.create(payload);
// };

// const getAllCategories = async () => {
//   return await Category.find();
// };

// const getSingleCategory = async (id: string) => {
//   return await Category.findById(id);
// };

// const updateCategory = async (id: string, payload: Partial<ICategory>) => {
//   return await Category.findByIdAndUpdate(id, payload, { new: true });
// };

// const deleteCategory = async (id: string) => {
//   return await Category.findByIdAndDelete(id);
// };

// export const CategoryService = {
//   createCategory,
//   getAllCategories,
//   getSingleCategory,
//   updateCategory,
//   deleteCategory,
// };
import Category from './category.model';
import { ICategory } from './category.interface';

const createCategory = async (payload: Partial<ICategory>) => {
  return await Category.create(payload);
};

const getAllCategories = async (userId: string) => {
  return await Category.find({ createdBy: userId });
};


const getSingleCategory = async (id: string) => {
  return await Category.findById(id);
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  return await Category.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCategory = async (id: string) => {
  return await Category.findByIdAndDelete(id);
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};

import { z } from 'zod';

// ✅ Create validation
export const createCategoryValidation = z.object({
  body: z.object({
    categoryName: z.string().min(1, 'Category name is required'),
    imageUrls: z.array(z.string().url('Must be valid URL')).max(3).optional(),
  }),
});

// ✅ Update validation
export const updateCategoryValidation = z.object({
  body: z.object({
    categoryName: z.string().optional(),
    imageUrls: z.array(z.string().url('Must be valid URL')).max(3).optional(),
  }),
});

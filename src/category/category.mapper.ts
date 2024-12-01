import { Category } from '@prisma/client';
import { CategoryResponse } from './category.model';

export function toCategoryResponse(category: Category): CategoryResponse {
  return {
    categoryId: category.categoryId,
    name: category.name,
  };
}

export function toCategoriesResponse(
  categories: Category[],
): CategoryResponse[] {
  if (categories.length === 0) return [];

  return categories.map((category) => ({
    categoryId: category.categoryId,
    name: category.name,
  }));
}

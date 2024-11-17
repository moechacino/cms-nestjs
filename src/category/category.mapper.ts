import { Category } from '@prisma/client';
import { CategoryResponse } from './category.dto';

export function toCategoryResponse(category: Category): CategoryResponse {
  return new CategoryResponse({
    categoryId: category.categoryId,
    name: category.name,
  });
}

export function toCategoriesResponse(
  categories: Category[],
): CategoryResponse[] {
  if (categories.length === 0) return [];

  return categories.map(
    (category) =>
      new CategoryResponse({
        categoryId: category.categoryId,
        name: category.name,
      }),
  );
}

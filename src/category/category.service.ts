import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CategoryRequestDto, CategoryResponse } from './category.dto';
import { toCategoriesResponse, toCategoryResponse } from './category.mapper';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(request: CategoryRequestDto): Promise<CategoryResponse> {
    const categoryName = await this.categoryNameRecursion(request.name);
    const category = await this.prismaService.category.create({
      data: {
        name: categoryName,
      },
    });

    return toCategoryResponse(category);
  }

  async getAll(): Promise<CategoryResponse[]> {
    const categories = await this.prismaService.category.findMany();
    return toCategoriesResponse(categories);
  }

  async getById(categoryId: number): Promise<CategoryResponse> {
    const category = await this.prismaService.category.findUnique({
      where: {
        categoryId,
      },
    });

    if (!category) throw new NotFoundException(`${categoryId} not found`);

    return toCategoryResponse(category);
  }

  async update(
    categoryId: number,
    request: CategoryRequestDto,
  ): Promise<CategoryResponse> {
    const category = await this.prismaService.category.update({
      where: {
        categoryId,
      },
      data: {
        ...request,
      },
    });

    return toCategoryResponse(category);
  }

  async delete(categoryId: number): Promise<CategoryResponse> {
    const category = await this.prismaService.category.delete({
      where: {
        categoryId,
      },
    });
    return toCategoryResponse(category);
  }

  private async categoryNameRecursion(name: string): Promise<string> {
    let category = await this.prismaService.category.findFirst({
      where: { name },
    });

    if (category) {
      return await this.categoryNameRecursion(`${name}-copy`);
    }

    return name;
  }
}

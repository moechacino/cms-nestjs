import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryTestService {
  constructor(private readonly prismaService: PrismaService) {}

  async deleteCategories() {
    await this.prismaService.category.deleteMany();
  }

  async createCategory(name: string = 'category'): Promise<Category> {
    const data = await this.prismaService.category.create({
      data: { name: 'category' },
    });
    return data;
  }
}

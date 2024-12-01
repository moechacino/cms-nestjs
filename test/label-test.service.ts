import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import { LabelResponse } from '../src/label/label.model';

@Injectable()
export class LabelTestService {
  constructor(private readonly prismaService: PrismaService) {}

  async createLabel(name: string = 'new label'): Promise<LabelResponse> {
    const label = await this.prismaService.label.create({
      data: { name },
    });
    return {
      labelId: label.labelId,
      name: label.name,
    };
  }

  async deleteLabels() {
    await this.prismaService.label.deleteMany();
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  LabelCreateRequestDto,
  LabelResponse,
  LabelUpdateRequestDto,
} from './label.model';
import { toLabelResponse, toLabelsResponse } from './label.mapper';

@Injectable()
export class LabelService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(request: LabelCreateRequestDto): Promise<LabelResponse> {
    let labelName = await this.labelNameRecursion(request.labelName);
    const label = await this.prismaService.label.create({
      data: {
        name: labelName,
      },
    });
    return toLabelResponse(label);
  }

  async getAllLabels(): Promise<LabelResponse[]> {
    const labels = await this.prismaService.label.findMany();
    return toLabelsResponse(labels);
  }

  async getById(labelId: number): Promise<LabelResponse> {
    const label = await this.prismaService.label.findUniqueOrThrow({
      where: { labelId },
    });
    return toLabelResponse(label);
  }

  async update(
    labelId: number,
    request: LabelUpdateRequestDto,
  ): Promise<LabelResponse> {
    const label = await this.prismaService.label.update({
      where: { labelId },
      data: { name: request.labelName },
    });

    return toLabelResponse(label);
  }

  async delete(labelId: number): Promise<LabelResponse> {
    const label = await this.prismaService.label.delete({
      where: { labelId },
    });

    return toLabelResponse(label);
  }

  private async labelNameRecursion(labelName: string): Promise<string> {
    let label = await this.prismaService.label.findFirst({
      where: { name: labelName },
    });
    if (label) {
      const newName = await this.labelNameRecursion(`${labelName}-copy`);
      return newName;
    }
    return labelName;
  }
}

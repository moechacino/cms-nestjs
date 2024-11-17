import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';

@Injectable()
export class ArticleTestService {
  constructor(private readonly prismaService: PrismaService) {}
}

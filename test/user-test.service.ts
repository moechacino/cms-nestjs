import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload } from '../src/common/types/web.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserTestService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(username: string = 'cibay'): Promise<{
    userId: string;
    username: string;
    password: string;
  }> {
    const password = 'cibay';
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await this.prismaService.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'admin',
      },
    });
    return {
      userId: created.userId,
      username,
      password,
    };
  }

  async deleteUsers() {
    await this.prismaService.user.deleteMany();
  }
}

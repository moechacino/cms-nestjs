import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserTestService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async deleteUser(username: string) {
    await this.prismaService.user.deleteMany({ where: { username } });
  }
}

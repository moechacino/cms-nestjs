import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function adminSeeder(prisma: PrismaClient) {
  const data = {
    password: 'admin',
    username: 'admin',
  };

  await prisma.user.create({
    data: {
      username: data.username,
      password: await bcrypt.hash(data.password, 10),
      role: 'admin',
    },
  });
}

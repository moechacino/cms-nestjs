import { PrismaClient } from '@prisma/client';
import { adminSeeder } from './seeder/admin.seeder';
import { articleSeeder } from './seeder/article.seeder';

const prisma = new PrismaClient();

async function seed() {
  await adminSeeder(prisma);
  await articleSeeder(prisma);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { storageDirectory } from '../../src/common/config/multer.config';
export async function articleSeeder(prisma: PrismaClient) {
  const [labels, categories] = await Promise.all([
    labelSeeder(prisma),
    categorySeeder(prisma),
  ]);

  const storageUrl = process.env['STORAGE_URL'];
  const data: Prisma.ArticleCreateManyInput[] = [
    {
      title: 'Exploring AI in Healthcare',
      content:
        'Artificial Intelligence is revolutionizing the healthcare industry...',
      slug: 'exploring-ai-in-healthcare',
      author: 'John Doe',
      thumbnailUrl: `${storageUrl}/${storageDirectory.thumbnail.subPath}/eg-thumbnail.jpg`,
      thumbnailFilename: 'ai-healthcare-thumbnail.jpg',
      thumbnailAlt: 'AI in healthcare',
      categoryId: categories[1].categoryId,
      articleId: '7037a54d-b336-4a2c-a14d-275ce637fdcd',
    },
    {
      title: 'The Future of Quantum Computing',
      content: 'Quantum computing is set to change the world as we know it...',
      slug: 'future-of-quantum-computing',
      author: 'Jane Smith',
      thumbnailUrl: `${storageUrl}/${storageDirectory.thumbnail.subPath}/eg-thumbnail.jpg`,
      thumbnailFilename: 'quantum-computing-thumbnail.jpg',
      thumbnailAlt: 'Quantum computing',
      categoryId: categories[0].categoryId,
      articleId: '478bbad5-acee-43d2-9afd-7e8c3d057cd3',
    },
    {
      title: 'Sustainable Energy Solutions',
      content: 'Sustainable energy is crucial for the future of our planet...',
      slug: 'sustainable-energy-solutions',
      author: 'Alice Brown',
      thumbnailUrl: `${storageUrl}/${storageDirectory.thumbnail.subPath}/eg-thumbnail.jpg`,
      thumbnailFilename: 'sustainable-energy-thumbnail.jpg',
      thumbnailAlt: 'Sustainable energy',
      categoryId: categories[0].categoryId,
      articleId: '262d49ab-2bbb-47c1-9888-306446cd59ce',
    },
  ];
  data.forEach(() => {
    fs.copyFileSync(
      'prisma/seeder/eg-thumbnail.jpg',
      `${storageDirectory.thumbnail.mainPath}/eg-thumbnail.jpg`,
    );
  });

  await prisma.article.createMany({
    data,
  });

  //   create article with labels
  await prisma.labelOnArticle.createMany({
    data: [
      {
        articleId: data[0].articleId,
        labelId: labels[0].labelId,
      },
      {
        articleId: data[0].articleId,
        labelId: labels[1].labelId,
      },
    ],
  });
}

async function categorySeeder(prisma: PrismaClient) {
  const data: Prisma.CategoryCreateInput[] = [
    {
      name: 'business',
    },
    {
      name: 'technology',
    },
  ];

  const categories = await Promise.all(
    data.map((data) => prisma.category.create({ data })),
  );
  return categories;
}

async function labelSeeder(prisma: PrismaClient) {
  const data: Prisma.LabelCreateInput[] = [
    {
      name: 'Artificial Intelligent',
    },
    {
      name: 'IoT',
    },
    {
      name: 'Blockchain',
    },
  ];

  const labels = await Promise.all(
    data.map((data) => prisma.label.create({ data })),
  );
  return labels;
}

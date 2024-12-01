import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ArticleCreateRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @Transform(({ value }) => {
    console.log(value);
    console.log(typeof value);
    if (value === '' || !value) return [];

    let parsed: [];
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      throw new BadRequestException('labelsId must be a valid JSON array.');
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException('labelsId must be an array of numbers.');
    }
    return parsed.map((val) => {
      if (isNaN(Number(val))) {
        throw new BadRequestException(
          `Invalid label ID: ${val}. Must be a number.`,
        );
      }
      return parseInt(val);
    });
  })
  labelsId: number[];
}

export class ArticleUpdateRequestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || !value) return [];

    let parsed: [];
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      throw new BadRequestException('labelsId must be a valid JSON array.');
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException('labelsId must be an array of numbers.');
    }
    return parsed.map((val) => {
      if (isNaN(Number(val))) {
        throw new BadRequestException(
          `Invalid label ID: ${val}. Must be a number.`,
        );
      }
      return parseInt(val);
    });
  })
  labelsId?: number[];

  @IsOptional()
  newThumbnail?: Express.Multer.File;
}

export class ArticleQueryRequestDto {
  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value === '' || isNaN(Number(value))) return 16;

    return parseInt(value);
  })
  take: number = 16;

  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value === '' || isNaN(Number(value))) return 1;

    return parseInt(value);
  })
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || isNaN(Number(value))) return undefined;
    return parseInt(value);
  })
  categoryId: number = undefined;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || !value) return [];

    let parsed: [];
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      throw new BadRequestException('labelsId must be a valid JSON array.');
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException('labelsId must be an array of numbers.');
    }
    return parsed.map((val) => {
      if (isNaN(Number(val))) {
        throw new BadRequestException(
          `Invalid label ID: ${val}. Must be a number.`,
        );
      }
      return parseInt(val);
    });
  })
  labelsId: number[] = [];

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  sort: 'recent' | 'oldest' = undefined;
}

export type ArticleWithCategoriesAndLabels = Prisma.ArticleGetPayload<{
  include: {
    category: {
      select: {
        categoryId: true;
        name: true;
      };
    };
    labels: {
      include: {
        label: {
          select: {
            labelId: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type ArticleResponse = {
  articleId: string;
  title: string;
  content: string;
  author: string | null;
  slug: string;
  thumbnailUrl: string;
  thumbnailFilename: string;
  thumbnailAlt: string;
  createdAt: Date;
  updatedAt: Date;
} & {
  category: {
    categoryId: number;
    name: string;
  };
  labels: {
    labelId: number;
    name: string;
  }[];
};

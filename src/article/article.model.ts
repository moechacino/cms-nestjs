import { BadRequestException } from '@nestjs/common';
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
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsNotEmpty()
  @Transform(({ value }: { value: string | string[] }) => {
    if (value === '') return [];
    // class-trans send 1 data that is not array if the query request just 1 value in array
    if (typeof value === 'string') {
      if (!isNaN(Number(value))) return [Number(value)];
      throw new BadRequestException('labelsId must be array of number');
    }

    return value.map((val) => {
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
  @Transform(({ value }: { value: string | string[] }) => {
    if (value === '') return [];
    // class-trans send 1 data that is not array if the query request just 1 value in array
    if (typeof value === 'string') {
      if (!isNaN(Number(value))) return [Number(value)];
      throw new BadRequestException('labelsId must be array of number');
    }

    return value.map((val) => {
      if (isNaN(Number(val))) {
        throw new BadRequestException(
          `Invalid label ID: ${val}. Must be a number.`,
        );
      }
      return parseInt(val);
    });
  })
  labelsId?: number[];
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
  @Transform(({ value }: { value: string | string[] }) => {
    if (value === '') return [];
    // class-trans send 1 data that is not array if the query request just 1 value in array
    if (typeof value === 'string') {
      if (!isNaN(Number(value))) return [Number(value)];
      throw new BadRequestException('labelsId must be array of number');
    }

    return value.map((val) => {
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

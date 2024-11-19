import { Type } from 'class-transformer';
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

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  labelsId: number[];
}

export class ArticleUpdateRequestDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  labelsId: number[];
}

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

import { ApiProperty } from '@nestjs/swagger';
import { File } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export type FileResponse = File;

export class FileUpdateRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  alt: string;
}

export type FileSortType = 'recent' | 'oldest';

export class FileQueryRequestDto {
  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    const sortType: FileSortType[] = ['recent', 'oldest'];
    return sortType.indexOf(value) !== -1 ? value : undefined;
  })
  sort: FileSortType = undefined;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @IsString()
  mimetype: string = undefined;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    !isNaN(Number(value)) && value !== null ? parseInt(value) : 16,
  )
  take: number = 16;

  @ApiProperty({ type: 'string' })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    !isNaN(Number(value)) && value !== null ? parseInt(value) : 16,
  )
  page: number = 1;
}

export class FileDeleteRequestDto {
  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true, message: 'Each fileId must be a number' })
  fileIds: number[];
}

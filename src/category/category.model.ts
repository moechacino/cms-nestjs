import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export type CategoryResponse = {
  categoryId: number;
  name: string;
};

import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export type CategoryResponse = {
  categoryId: number;
  name: string;
};

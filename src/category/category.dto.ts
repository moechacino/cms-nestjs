import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CategoryRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CategoryResponse {
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  constructor(strict: CategoryResponse) {
    Object.assign(this, strict);
  }
}

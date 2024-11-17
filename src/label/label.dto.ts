import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LabelCreateRequestDto {
  @IsNotEmpty()
  @IsString()
  labelName: string;
}

export class LabelUpdateRequestDto {
  @IsNotEmpty()
  @IsString()
  labelName: string;
}

export class LabelResponse {
  @IsNotEmpty()
  @IsNumber()
  labelId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  constructor(strict: LabelResponse) {
    Object.assign(this, strict);
  }
}

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

export type LabelResponse = {
  labelId: number;
  name: string;
};

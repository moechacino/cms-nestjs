import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LabelCreateRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  labelName: string;
}

export class LabelUpdateRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  labelName: string;
}

export type LabelResponse = {
  labelId: number;
  name: string;
};

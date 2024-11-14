import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserLoginResponseDto {
  @Expose()
  token: string;
  @Expose()
  user: { username: string };

  constructor(strict: UserLoginResponseDto) {
    Object.assign(this, strict);
  }
}

import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginRequestDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export type UserLoginResponse = {
  token: string;
  user: { username: string };
};

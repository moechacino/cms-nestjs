import { User } from '@prisma/client';
import { UserLoginResponseDto } from './user.dto';

export function toUserLoginResponse(
  user: User,
  token: string,
): UserLoginResponseDto {
  return new UserLoginResponseDto({
    token: token,
    user: {
      username: user.username,
    },
  });
}

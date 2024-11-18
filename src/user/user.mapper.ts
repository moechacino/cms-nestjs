import { User } from '@prisma/client';
import { UserLoginResponse } from './user.dto';

export function toUserLoginResponse(
  user: User,
  token: string,
): UserLoginResponse {
  return {
    token: token,
    user: {
      username: user.username,
    },
  };
}

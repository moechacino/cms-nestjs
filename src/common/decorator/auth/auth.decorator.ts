import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayload } from '../../types/web.type';

export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user) {
      return request.user as AuthPayload;
    } else {
      throw new UnauthorizedException({
        message: 'Unauthorized',
      });
    }
  },
);

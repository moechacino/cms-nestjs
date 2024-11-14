import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../decorator/roles/roles.decorator';
import { AuthPayload } from '../../types/web.type';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles: string[] = this.reflector.get(Roles, context.getHandler());

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthPayload;

    if (roles.indexOf(user.role) != -1) {
      return true;
    } else {
      throw new UnauthorizedException({
        message: 'Dont have access',
      });
    }
  }
}

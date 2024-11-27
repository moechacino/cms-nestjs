import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../decorator/roles/roles.decorator';
import { AuthPayload } from '../../types/web.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: AuthPayload;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: string[] = this.reflector.get(Roles, context.getHandler());

    if (!roles) return true;

    const request: CustomRequest = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token = authHeader.split(' ')[1];
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_KEY_AT'),
    });
    request.user = decoded;

    const user = request.user;

    const userAgent = request.headers['user-agent'];
    if (user.role === 'admin') {
      const refreshToken = request.cookies?.['admin_rt'];
      if (!refreshToken) {
        if (
          !/android/i.test(userAgent) &&
          !/iphone|ipad|ipod/i.test(userAgent)
        ) {
          throw new UnauthorizedException(
            'You have been logged out. Please login again',
          );
        }
      }
    }

    if (roles.indexOf(user.role) != -1) {
      return true;
    } else {
      throw new UnauthorizedException({
        message: 'Dont have access',
      });
    }
  }
}

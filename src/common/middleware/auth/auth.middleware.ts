import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { AuthPayload } from '../../types/web.type';

interface CustomRequest extends Request {
  user?: AuthPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async use(req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }
    const token = authHeader.split(' ')[1];
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_KEY_AT'),
    });
    req.user = decoded;
    next();
  }
}

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { JwtService } from '@nestjs/jwt';
import { UserLoginRequestDto, UserLoginResponse } from './user.model';
import * as bcrypt from 'bcrypt';
import { toUserLoginResponse } from './user.mapper';
import { AuthPayload } from '../common/types/web.type';
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    request: UserLoginRequestDto,
  ): Promise<{ refreshToken: string; data: UserLoginResponse }> {
    const user = await this.prismaService.user.findUnique({
      where: { username: request.username },
    });
    if (!user) {
      this.logger.warn('user not registered');
      throw new UnauthorizedException('wrong username or password');
    }

    const isMatch = await bcrypt.compare(request.password, user.password);
    if (!isMatch) throw new UnauthorizedException('wrong username or password');
    const payload: AuthPayload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_KEY_AT'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_KEY_RT'),
        expiresIn: '30d',
      }),
    ]);

    await this.prismaService.user.update({
      where: {
        userId: user.userId,
      },
      data: {
        token: refreshToken,
      },
    });
    this.logger.info('token created');

    return {
      refreshToken,
      data: toUserLoginResponse(user, accessToken),
    };
  }

  async logout(user: AuthPayload): Promise<void> {
    await this.prismaService.user.update({
      where: {
        userId: user.userId,
      },
      data: {
        token: null,
      },
    });
  }

  async getAccessToken(refreshToken: string): Promise<{ token: string }> {
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token is not provided');

    const decoded = await this.jwtService.verifyAsync<AuthPayload>(
      refreshToken,
      { secret: this.configService.get('JWT_KEY_RT') },
    );

    if (decoded.role !== 'admin')
      throw new ForbiddenException('Dont have access');

    const user = await this.prismaService.user.findUniqueOrThrow({
      where: { userId: decoded.userId },
    });

    if (user.token !== refreshToken)
      throw new UnauthorizedException(
        'Logged in another device. Please login again',
      );

    if (user.token === null)
      throw new UnauthorizedException({
        message: 'You have been logged out. Please login again',
      });

    const token = await this.jwtService.signAsync(decoded, {
      secret: this.configService.get('JWT_KEY_AT'),
    });

    return { token };
  }
}

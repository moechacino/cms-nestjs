import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserLoginRequestDto, UserLoginResponse } from './user.model';
import { AuthPayload, WebResponse } from '../common/types/web.type';
import { Response } from 'express';
import { Roles } from '../common/decorator/roles/roles.decorator';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Cookies } from '../common/decorator/cookies/cookies.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiDocsUserLogin,
  ApiDocsUserLogout,
  ApiDocsUserNewAccessToken,
} from '../common/decorator/docs/user.docs.decorator';
import { ConfigService } from '@nestjs/config';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly configService: ConfigService,
  ) {}

  @ApiDocsUserLogin()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() request: UserLoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<UserLoginResponse>> {
    const { data, refreshToken } = await this.service.login(request);
    response.cookie('admin_rt', refreshToken, {
      httpOnly: true,
      sameSite: this.configService.get('NODE_ENV') === 'prod' ? 'none' : 'lax',
      secure: this.configService.get('NODE_ENV') === 'prod', // false di dev, true di production
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return {
      success: true,
      data: data,
    };
  }

  @ApiDocsUserLogout()
  @Patch('logout')
  @Roles(['admin'])
  @HttpCode(200)
  async logout(
    @Auth() user: AuthPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse> {
    await this.service.logout(user);

    response.clearCookie('admin_rt', {
      httpOnly: true,
      sameSite: this.configService.get('NODE_ENV') === 'prod' ? 'none' : 'lax',
      secure: this.configService.get('NODE_ENV') === 'prod', // false di dev, true di production
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    return {
      success: true,
    };
  }

  @ApiDocsUserNewAccessToken()
  @Get('access-token')
  @HttpCode(200)
  async getAccessToken(
    @Cookies('admin_rt') refreshToken: string,
  ): Promise<WebResponse<{ token: string }>> {
    const result = await this.service.getAccessToken(refreshToken);
    return {
      success: true,
      data: result,
    };
  }
}

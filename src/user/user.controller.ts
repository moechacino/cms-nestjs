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
import { UserLoginRequestDto, UserLoginResponse } from './user.dto';
import { AuthPayload, WebResponse } from '../common/types/web.type';
import { Response } from 'express';
import { Roles } from '../common/decorator/roles/roles.decorator';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Cookies } from '../common/decorator/cookies/cookies.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() request: UserLoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<WebResponse<UserLoginResponse>> {
    const { data, refreshToken } = await this.service.login(request);
    response.cookie('admin_rt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return {
      success: true,
      data: data,
    };
  }

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
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    return {
      success: true,
    };
  }

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

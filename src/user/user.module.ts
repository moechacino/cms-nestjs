import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from '../common/middleware/auth/auth.middleware';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from '../common/guard/role/role.guard';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: 'user/login',
          method: RequestMethod.POST,
        },
        {
          path: 'user/access-token',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(UserController);
  }
}

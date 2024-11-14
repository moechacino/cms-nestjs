import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

type Role = UserRole;

export const Roles = Reflector.createDecorator<Role[]>();

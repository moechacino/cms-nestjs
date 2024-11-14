import { UserRole } from '@prisma/client';

export type WebResponse<T = void> = T extends void
  ? { success: boolean }
  : T extends DataWithPagination<infer U>
    ? {
        success: boolean;
        data: U;
        pagination: {
          currentPage: T['currentPage'];
          totalPage: T['totalPage'];
          totalData: T['totalData'];
        };
      }
    : {
        success: boolean;
        data: T;
      };

export type DataWithPagination<T> = {
  data: T;
  totalData: number;
  totalPage: number;
  currentPage: number;
};

export type AuthPayload = {
  userId: string;
  username: string;
  role: UserRole;
};

export type ErrResponse = {
  success: boolean;
  errors: {
    message: string;
    details?: any;
  };
};

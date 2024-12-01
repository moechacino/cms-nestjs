import { DataWithPagination, WebResponse } from '../common/types/web.type';
import {
  FileDeleteRequestDto,
  FileQueryRequestDto,
  FileResponse,
  FileUpdateRequestDto,
} from './file.model';

export interface FileControllerInterface {
  uploadMultiple(files: Express.Multer.File[]): Promise<WebResponse>;
  getAll(
    query: FileQueryRequestDto,
  ): Promise<WebResponse<DataWithPagination<FileResponse[]>>>;
  getOne(fileId: number): Promise<WebResponse<FileResponse>>;
  update(
    fileId: number,
    request: FileUpdateRequestDto,
  ): Promise<WebResponse<FileResponse>>;
  deleteMultiple(
    request: FileDeleteRequestDto,
  ): Promise<WebResponse<FileResponse[]>>;
}

export interface FileServiceInterface {
  uploadMultiple(files: Express.Multer.File[]): Promise<void>;
  getAll(
    query: FileQueryRequestDto,
  ): Promise<DataWithPagination<FileResponse[]>>;
  getOne(fileId: number): Promise<FileResponse>;
  update(fileId: number, request: FileUpdateRequestDto): Promise<FileResponse>;
  deleteMultiple(request: FileDeleteRequestDto): Promise<FileResponse[]>;
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileControllerInterface } from './file.interface';
import { WebResponse, DataWithPagination } from '../common/types/web.type';
import {
  FileResponse,
  FileQueryRequestDto,
  FileUpdateRequestDto,
  FileDeleteRequestDto,
} from './file.model';
import { Roles } from '../common/decorator/roles/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  getMulterConfig,
  storageDirectory,
} from '../common/config/multer.config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('file-server')
@Controller('files')
export class FileController implements FileControllerInterface {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @Roles(['admin'])
  @HttpCode(201)
  @UseInterceptors(
    FilesInterceptor(
      'files',
      5,
      getMulterConfig(storageDirectory.files.mainPath),
    ),
  )
  async uploadMultiple(
    @UploadedFiles()
    files: Express.Multer.File[],
  ): Promise<WebResponse> {
    await this.fileService.uploadMultiple(files);
    return {
      success: true,
    };
  }

  @Get()
  @Roles(['admin'])
  async getAll(
    @Query() query: FileQueryRequestDto,
  ): Promise<WebResponse<DataWithPagination<FileResponse[]>>> {
    const { data, currentPage, totalData, totalPage } =
      await this.fileService.getAll(query);
    return {
      success: true,
      data,
      pagination: {
        currentPage,
        totalData,
        totalPage,
      },
    };
  }

  @Get(':fileId')
  @Roles(['admin'])
  async getOne(
    @Param('fileId', ParseIntPipe) fileId: number,
  ): Promise<WebResponse<FileResponse>> {
    const data = await this.fileService.getOne(fileId);
    return {
      success: true,
      data,
    };
  }

  @Patch(':fileId')
  @Roles(['admin'])
  async update(
    @Param('fileId') fileId: number,
    @Body() request: FileUpdateRequestDto,
  ): Promise<WebResponse<FileResponse>> {
    const data = await this.fileService.update(fileId, request);
    return {
      success: true,
      data,
    };
  }

  @Delete()
  @Roles(['admin'])
  async deleteMultiple(
    @Body() request: FileDeleteRequestDto,
  ): Promise<WebResponse<FileResponse[]>> {
    const data = await this.fileService.deleteMultiple(request);
    return {
      success: true,
      data,
    };
  }
}

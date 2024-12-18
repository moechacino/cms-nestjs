import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../common/decorator/roles/roles.decorator';
import { DataWithPagination, WebResponse } from '../common/types/web.type';
import {
  LabelCreateRequestDto,
  LabelResponse,
  LabelUpdateRequestDto,
} from '../label/label.model';
import { LabelService } from '../label/label.service';
import {
  CategoryRequestDto,
  CategoryResponse,
} from '../category/category.model';
import { CategoryService } from '../category/category.service';
import {
  ArticleCreateRequestDto,
  ArticleQueryRequestDto,
  ArticleResponse,
  ArticleUpdateRequestDto,
} from './article.model';
import { ArticleService } from './article.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  getMulterConfig,
  storageDirectory,
} from '../common/config/multer.config';
import { ArticleThumbnailValidationPipe } from '../common/pipe/article-thumbnailvalidation/article-thumbnailvalidation.pipe';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import {
  ApiDocsDeleteArticle,
  ApiDocsGetAllArticle,
  ApiDocsGetLabelsByArticle,
  ApiDocsGetOneArticle,
  ApiDocsPostArticle,
  ApiDocsUpdateArticle,
} from '../common/decorator/docs/article.docs.decorator';
import {
  ApiDocsCreateCategories,
  ApiDocsDeleteCategories,
  ApiDocsGetAllCategories,
  ApiDocsGetOneCategories,
  ApiDocsUpdateCategories,
} from '../common/decorator/docs/categories.docs.decorator';
import {
  ApiDocsCreateLabels,
  ApiDocsDeleteLabels,
  ApiDocsGetAllLabels,
  ApiDocsGetOneLabels,
  ApiDocsUpdateLabels,
} from '../common/decorator/docs/label.docs.decorator';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly labelService: LabelService,
    private readonly categoryService: CategoryService,
    private readonly articleService: ArticleService,
  ) {}

  @ApiTags('Articles')
  @ApiDocsPostArticle()
  @Post()
  @HttpCode(201)
  @Roles(['admin'])
  @UseInterceptors(
    FileInterceptor(
      'thumbnail',
      getMulterConfig(storageDirectory.thumbnail.mainPath),
    ),
  )
  async articleCreate(
    @UploadedFile(ArticleThumbnailValidationPipe)
    thumbnailFile: Express.Multer.File | undefined,
    @Body()
    request: ArticleCreateRequestDto,
  ): Promise<WebResponse<ArticleResponse>> {
    if (!thumbnailFile) throw new BadRequestException('No Thumbnail Provided');
    const data = await this.articleService.create(request, thumbnailFile);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Articles')
  @Get()
  @ApiDocsGetAllArticle()
  @HttpCode(200)
  async articleGetAll(
    @Query()
    query: ArticleQueryRequestDto,
  ): Promise<WebResponse<DataWithPagination<ArticleResponse[]>>> {
    const { currentPage, data, totalData, totalPage } =
      await this.articleService.getAll(query);
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

  @ApiTags('Labels')
  @ApiDocsCreateLabels()
  @Post('labels')
  @HttpCode(201)
  @Roles(['admin'])
  async labelCreate(
    @Body() request: LabelCreateRequestDto,
  ): Promise<WebResponse<LabelResponse>> {
    const data = await this.labelService.create(request);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Labels')
  @ApiDocsGetAllLabels()
  @Get('labels')
  @HttpCode(200)
  async labelGetAll(): Promise<WebResponse<LabelResponse[]>> {
    const data = await this.labelService.getAllLabels();
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Labels')
  @ApiDocsUpdateLabels()
  @Patch('labels/:labelId')
  @Roles(['admin'])
  @HttpCode(200)
  async labelUpdate(
    @Param('labelId', ParseIntPipe) labelId: number,
    @Body() request: LabelUpdateRequestDto,
  ): Promise<WebResponse<LabelResponse>> {
    const data = await this.labelService.update(labelId, request);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Labels')
  @ApiDocsGetOneLabels()
  @Get('labels/:labelId')
  @HttpCode(200)
  async labelGetById(
    @Param('labelId', ParseIntPipe) labelId: number,
  ): Promise<WebResponse<LabelResponse>> {
    const data = await this.labelService.getById(labelId);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Labels')
  @ApiDocsDeleteLabels()
  @Delete('labels/:labelId')
  @Roles(['admin'])
  @HttpCode(200)
  async labelDelete(
    @Param('labelId', ParseIntPipe) labelId: number,
  ): Promise<WebResponse<LabelResponse>> {
    const data = await this.labelService.delete(labelId);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Categories')
  @ApiDocsCreateCategories()
  @Post('categories')
  @HttpCode(201)
  @Roles(['admin'])
  async categoryCreate(
    @Body() request: CategoryRequestDto,
  ): Promise<WebResponse<CategoryResponse>> {
    const data = await this.categoryService.create(request);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Categories')
  @ApiDocsGetAllCategories()
  @Get('categories')
  @HttpCode(200)
  async categoryGetAll(): Promise<WebResponse<CategoryResponse[]>> {
    const data = await this.categoryService.getAll();
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Categories')
  @ApiDocsGetOneCategories()
  @Get('categories/:categoryId')
  @HttpCode(200)
  async categoryGetByid(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<WebResponse<CategoryResponse>> {
    const data = await this.categoryService.getById(categoryId);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Categories')
  @ApiDocsUpdateCategories()
  @Patch('categories/:categoryId')
  @HttpCode(200)
  async categoryUpdate(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() request: CategoryRequestDto,
  ): Promise<WebResponse<CategoryResponse>> {
    const data = await this.categoryService.update(categoryId, request);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Categories')
  @ApiDocsDeleteCategories()
  @Delete('categories/:categoryId')
  @HttpCode(200)
  async categoryDelete(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<WebResponse<CategoryResponse>> {
    const data = await this.categoryService.delete(categoryId);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Articles')
  @ApiDocsGetOneArticle()
  @Get(':articleId')
  @HttpCode(200)
  async articleGetById(
    @Param('articleId', ParseUUIDPipe) articleId: string,
  ): Promise<WebResponse<ArticleResponse>> {
    const data = await this.articleService.getById(articleId);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Articles')
  @ApiDocsUpdateArticle()
  @Patch(':articleId')
  @Roles(['admin'])
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor(
      'newThumbnail',
      getMulterConfig(storageDirectory.thumbnail.mainPath),
    ),
  )
  async articleUpdate(
    @Param('articleId') articleId: string,
    @UploadedFile(ArticleThumbnailValidationPipe)
    newThumbnailFile: Express.Multer.File | undefined,
    @Body() request: ArticleUpdateRequestDto,
  ): Promise<WebResponse<ArticleResponse>> {
    const data = await this.articleService.update(
      articleId,
      request,
      newThumbnailFile,
    );
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Articles')
  @ApiDocsDeleteArticle()
  @Delete(':articleId')
  @HttpCode(200)
  async articleDelete(
    @Param('articleId') articleId: string,
  ): Promise<WebResponse<ArticleResponse>> {
    const data = await this.articleService.delete(articleId);
    return {
      success: true,
      data,
    };
  }

  @ApiTags('Articles')
  @ApiDocsGetLabelsByArticle()
  @Get(':articleId/labels')
  @HttpCode(200)
  async labelsRelateOnArticle(
    @Param('articleId') articleId: string,
  ): Promise<WebResponse<LabelResponse[]>> {
    const data = await this.articleService.getLabels(articleId);
    return {
      success: true,
      data,
    };
  }
}

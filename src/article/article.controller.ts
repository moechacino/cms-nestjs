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
} from '@nestjs/common';
import { Roles } from '../common/decorator/roles/roles.decorator';
import { WebResponse } from '../common/types/web.type';
import {
  LabelCreateRequestDto,
  LabelResponse,
  LabelUpdateRequestDto,
} from '../label/label.dto';
import { LabelService } from '../label/label.service';
import { CategoryRequestDto, CategoryResponse } from '../category/category.dto';
import { CategoryService } from '../category/category.service';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly labelService: LabelService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  @HttpCode(200)
  async articleGetAll() {}

  @Post()
  @HttpCode(201)
  @Roles(['admin'])
  async articleCreate() {}

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

  @Get('labels')
  @HttpCode(200)
  async labelGetAll(): Promise<WebResponse<LabelResponse[]>> {
    const data = await this.labelService.getAllLabels();
    return {
      success: true,
      data,
    };
  }

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

  @Get('categories')
  @HttpCode(200)
  async categoryGetAll(): Promise<WebResponse<CategoryResponse[]>> {
    const data = await this.categoryService.getAll();
    return {
      success: true,
      data,
    };
  }
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

  @Get(':articleId')
  @HttpCode(200)
  async articleGetById(@Param('articleId') articleId: string) {}

  @Patch(':articleId')
  @HttpCode(200)
  async articleUpdate(@Param('articleId') articleId: string) {}

  @Delete(':articleId')
  @HttpCode(200)
  async articleDelete(@Param('articleId') articleId: string) {}

  @Get(':articleId/labels')
  @HttpCode(200)
  async labelsRelateOnArticle(@Param('articleId') articleId: string) {}

  @Get(':articleId/suggestions')
  @HttpCode(200)
  async articleSuggestion(@Param('articleId') articleId: string) {}
}

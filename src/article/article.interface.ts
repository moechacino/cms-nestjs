import { DataWithPagination } from '../common/types/web.type';
import { LabelResponse } from '../label/label.dto';
import {
  ArticleCreateRequestDto,
  ArticleQueryRequestDto,
  ArticleResponse,
  ArticleUpdateRequestDto,
} from './article.model';

export interface ArticleInterface {
  create(
    request: ArticleCreateRequestDto,
    thumbnailFile: Express.Multer.File,
  ): Promise<ArticleResponse>;

  getAll(
    query: ArticleQueryRequestDto,
  ): Promise<DataWithPagination<ArticleResponse[]>>;

  getById(articleId: string): Promise<ArticleResponse>;

  update(
    articleId: string,
    request: ArticleUpdateRequestDto,
    newThumbnailFile: Express.Multer.File | undefined,
  ): Promise<ArticleResponse>;

  delete(articleId: string): Promise<ArticleResponse>;

  getLabels(articleId: string): Promise<LabelResponse[]>;
}

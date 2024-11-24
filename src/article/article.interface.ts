import { DataWithPagination } from '../common/types/web.type';
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
}

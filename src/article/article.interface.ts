import { DataWithPagination } from '../common/types/web.type';
import {
  ArticleCreateRequestDto,
  ArticleQueryRequestDto,
  ArticleResponse,
} from './article.model';

export interface ArticleInterface {
  create(
    request: ArticleCreateRequestDto,
    thumbnailFile: Express.Multer.File,
  ): Promise<ArticleResponse>;

  getAll(
    query: ArticleQueryRequestDto,
  ): Promise<DataWithPagination<ArticleResponse[]>>;
}

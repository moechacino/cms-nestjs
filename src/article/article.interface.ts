import { ArticleCreateRequestDto, ArticleResponse } from './article.model';

export interface ArticleInterface {
  create(
    request: ArticleCreateRequestDto,
    thumbnailFile: Express.Multer.File,
  ): Promise<ArticleResponse>;
}

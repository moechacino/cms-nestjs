import {
  ArticleResponse,
  ArticleWithCategoriesAndLabels,
} from './article.model';

export function toArticleResponse(
  article: ArticleWithCategoriesAndLabels,
): ArticleResponse {
  return {
    articleId: article.articleId,
    author: article.author || null,
    content: article.content,
    slug: article.slug,
    title: article.title,
    thumbnailUrl: article.thumbnailUrl,
    thumbnailFilename: article.thumbnailFilename,
    thumbnailAlt: article.thumbnailAlt,
    category: {
      categoryId: article.category.categoryId,
      name: article.category.name,
    },
    labels: article.labels.map((label) => ({
      labelId: label.label.labelId,
      name: label.label.name,
    })),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

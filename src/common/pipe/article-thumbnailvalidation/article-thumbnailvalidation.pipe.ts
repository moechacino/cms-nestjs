import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as fs from 'fs';
import { storageDirectory } from '../../config/multer.config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ArticleThumbnailValidationPipe implements PipeTransform {
  private readonly maxSize = 5 * 1024 * 1024; // 5MB
  private readonly validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      return undefined;
    }

    if (!this.validTypes.includes(file.mimetype)) {
      await fs.promises
        .unlink(`${storageDirectory.thumbnail.mainPath}/${file.filename}`)
        .catch(() => {
          this.logger.error(`failed to delete thumbnail ${file.filename}`);
        });
      throw new BadRequestException(
        'Invalid file type. Only images jpeg, jpg, and png',
      );
    }

    if (file.size > this.maxSize) {
      await fs.promises
        .unlink(`${storageDirectory.thumbnail.mainPath}/${file.filename}`)
        .catch(() => {
          this.logger.error(`failed to delete thumbnail ${file.filename}`);
        });
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    return file;
  }
}

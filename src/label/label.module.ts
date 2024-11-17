import { Module } from '@nestjs/common';
import { LabelService } from './label.service';

@Module({
  providers: [LabelService],
  exports: [LabelService],
})
export class LabelModule {}

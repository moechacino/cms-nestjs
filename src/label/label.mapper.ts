import { Label } from '@prisma/client';
import { LabelResponse } from './label.dto';

export function toLabelResponse(label: Label): LabelResponse {
  return new LabelResponse({
    labelId: label.labelId,
    name: label.name,
  });
}

export function toLabelsResponse(labels: Label[]): LabelResponse[] {
  if (labels.length === 0) return [];

  return labels.map((label) => {
    return new LabelResponse({
      labelId: label.labelId,
      name: label.name,
    });
  });
}

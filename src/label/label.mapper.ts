import { Label } from '@prisma/client';
import { LabelResponse } from './label.model';

export function toLabelResponse(label: Label): LabelResponse {
  return {
    labelId: label.labelId,
    name: label.name,
  };
}

export function toLabelsResponse(labels: Label[]): LabelResponse[] {
  if (labels.length === 0) return [];

  return labels.map((label) => {
    return {
      labelId: label.labelId,
      name: label.name,
    };
  });
}

import type { Batch, Prisma } from '../../generated/prisma/index.js'

/*
  docs: https://www.typescriptlang.org/docs/handbook/utility-types.html
  Constructs a new type by picking the properties specified from the original type: 'Batch'
*/
export type BatchScalarFields = Pick<
  Batch,
  | 'id'
  | 'userId'
  | 'name'
  | 'category'
  | 'meadSubtype'
  | 'status'
  | 'currentStage'
  | 'startDate'
  | 'brewDate'
  | 'completedDate'
  | 'targetVolume'
  | 'actualVolume'
  | 'originalGravity'
  | 'finalGravity'
  | 'calculatedABV'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
  | 'lastLoggedAt'
  | 'thumbnailImageUrl'
  | 'isFavorite'
>


/* 
  Helper fcns to convert decimal and date values to strings.
*/
function decimalToString(value: Prisma.Decimal | null): string | null {
  return value === null ? null : value.toString()
}
function dateToISO(value: Date | null): string | null {
  return value === null ? null : value.toISOString()
}

/* 
  Converts a `Batch` Prisma model instance to a JSON-serializable object.
  Specifically, the fcn converts decimal and date values to strings
*/
export function toBatchDTO(batch: Batch) {
  return {
    id: batch.id,
    userId: batch.userId,
    name: batch.name,
    category: batch.category,
    meadSubtype: batch.meadSubtype ?? null,
    status: batch.status,
    currentStage: batch.currentStage,
    startDate: batch.startDate.toISOString(),
    brewDate: dateToISO(batch.brewDate),
    completedDate: dateToISO(batch.completedDate),
    targetVolume: decimalToString(batch.targetVolume),
    actualVolume: decimalToString(batch.actualVolume),
    originalGravity: decimalToString(batch.originalGravity),
    finalGravity: decimalToString(batch.finalGravity),
    calculatedABV: decimalToString(batch.calculatedABV),
    notes: batch.notes,
    createdAt: batch.createdAt.toISOString(),
    updatedAt: batch.updatedAt.toISOString(),
    lastLoggedAt: batch.lastLoggedAt.toISOString(),
    thumbnailImageUrl: batch.thumbnailImageUrl,
    isFavorite: batch.isFavorite,
  };
}

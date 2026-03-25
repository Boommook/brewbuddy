import type { Batch, Prisma } from '../../generated/prisma/index.js'

// scalar columns on `Batch` (no relations), aligned with `schema.prisma`.
export type BatchScalarFields = Pick<
  Batch,
  | 'id'
  | 'userId'
  | 'name'
  | 'category'
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
>

function decimalToString(value: Prisma.Decimal | null): string | null {
  return value === null ? null : value.toString()
}

function dateToISO(value: Date | null): string | null {
  return value === null ? null : value.toISOString()
}

export function toBatchDTO(batch: BatchScalarFields) {
  return {
    id: batch.id,
    userId: batch.userId,
    name: batch.name,
    category: batch.category,
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
  }
}

-- AlterTable
ALTER TABLE "BatchIngredientAddition" ADD COLUMN     "stageAdded" "BatchStage" NOT NULL DEFAULT 'PRIMARY';

-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "stageAdded" "BatchStage" NOT NULL DEFAULT 'PRIMARY';

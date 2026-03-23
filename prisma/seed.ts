import { IngredientType, PrismaClient } from '../src/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaPg({
  connectionString: databaseUrl
})

const prisma = new PrismaClient({ adapter, errorFormat: 'colorless' })

async function main() {
  await prisma.ingredient.createMany({
    data: [
      { name: 'Wildflower Honey', ingredientType: IngredientType.HONEY, defaultUnit: 'lb', isGlobal: true },
      { name: 'Orange Blossom Honey', ingredientType: IngredientType.HONEY, defaultUnit: 'lb', isGlobal: true },
      { name: 'Water', ingredientType: IngredientType.WATER, defaultUnit: 'gal', isGlobal: true },
      { name: '71B', ingredientType: IngredientType.YEAST, defaultUnit: 'g', isGlobal: true, brand: 'Lalvin' },
      { name: 'ICV K1-V1116', ingredientType: IngredientType.YEAST, defaultUnit: 'g', isGlobal: true, brand: 'Lalvin' },
      { name: 'ICV-D47', ingredientType: IngredientType.YEAST, defaultUnit: 'g', isGlobal: true, brand: 'Lalvin' },
      { name: 'Fermaid O', ingredientType: IngredientType.NUTRIENT, defaultUnit: 'g', isGlobal: true },
      { name: 'Blueberries', ingredientType: IngredientType.FRUIT, defaultUnit: 'lb', isGlobal: true }
    ],
    skipDuplicates: true
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
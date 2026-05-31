import { BatchStage, BrewCategory, MeadSubtype, PrismaClient, VolumeUnit } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// get the database url from the environment variables
const databaseUrl = process.env.DATABASE_URL

// error checking for database url not set
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

// create the prisma adapter
const adapter = new PrismaPg({
  connectionString: databaseUrl
})

// create the prisma client
const prisma = new PrismaClient({ adapter })

async function seedBasicRecipe(){

  const honey = await prisma.ingredient.findFirst({
    where: {
      name: 'Wildflower Honey',
    },
  })

  const water = await prisma.ingredient.findFirst({
    where: {
      name: 'Tap Water',
    },
  })

  const yeast = await prisma.ingredient.findFirst({
    where: {
      name: 'ICV K1-V1116',
    },
  })
  
  const nutrient = await prisma.ingredient.findFirst({
    where: {
      name: 'Fermaid O',
    },
  })

  if (!honey || !water || !yeast || !nutrient) {
    throw new Error('Ingredients not found')
  }
  
  const RECIPE_NAME = "Traditional Mead";

const ingredientLines = [
  { ingredientId: honey.id, amount: 3, unit: "lb", stageAdded: BatchStage.PRIMARY },
  { ingredientId: water.id, amount: 1, unit: "gal", stageAdded: BatchStage.PRIMARY },
  { ingredientId: yeast.id, amount: 2.5, unit: "g", stageAdded: BatchStage.PRIMARY },
  { ingredientId: nutrient.id, amount: 1.5, unit: "g", stageAdded: BatchStage.PRIMARY },
];

const existing = await prisma.recipe.findFirst({
  where: { name: RECIPE_NAME, userId: null },
});

if (existing) {
  await prisma.$transaction(async (tx) => {
    await tx.recipeIngredient.deleteMany({ where: { recipeId: existing.id } });

    await tx.recipe.update({
      where: { id: existing.id },
      data: {
        description: "A traditional 1 gallon mead recipe",
        targetVolume: 1,
        targetVolumeUnit: VolumeUnit.GAL,
        category: BrewCategory.MEAD,
        meadSubtype: MeadSubtype.SHOW_MEAD,
        ingredients: {
          create: ingredientLines.map((line, index) => ({
            ...line,
            sortOrder: index,
          })),
        },
      },
    });
  });
} else {
  await prisma.recipe.create({
    data: {
      userId: null,
      name: RECIPE_NAME,
      description: "A traditional 1 gallon mead recipe",
      targetVolume: 1,
      targetVolumeUnit: VolumeUnit.GAL,
      category: BrewCategory.MEAD,
      meadSubtype: MeadSubtype.SHOW_MEAD,
      ingredients: {
        create: ingredientLines.map((line, index) => ({
          ...line,
          sortOrder: index,
        })),
      },
    },
  });
}
}

async function main(){
    await seedBasicRecipe();
}

main()
  .then(async () => {
    await prisma.$disconnect() // then disconnect from the database
  })
  .catch(async (e) => {
    // if an error occurs, log the error and disconnect from the database
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


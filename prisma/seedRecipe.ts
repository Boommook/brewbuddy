import { BrewCategory, MeadSubtype, PrismaClient, VolumeUnit } from "../src/generated/prisma/index.js";
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
    const recipe = await prisma.recipe.create({
        data: {
            userId: null,
            name: 'Traditional Mead',
            description: 'A traditional 1 gallon mead recipe',
            targetVolume: 1,
            targetVolumeUnit: VolumeUnit.GAL,
            category: BrewCategory.MEAD,
            meadSubtype: MeadSubtype.SHOW_MEAD,
        },
    })
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


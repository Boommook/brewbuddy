// this file creates a global prisma client instance

import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaAdapter: PrismaPg | undefined
}

// get the database url from the environment variables
const databaseUrl = process.env.DATABASE_URL

// error checking for database url not set
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

// create the prisma adapter
const adapter =
  globalForPrisma.prismaAdapter ??
  new PrismaPg({ connectionString: databaseUrl })

// create the prisma client
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

// if not in production, set the global prisma client instance
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaAdapter = adapter
}
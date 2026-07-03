import { PrismaClient } from "../../../db/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.prisma || new PrismaClient({
      adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    }) as PrismaClient;
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;
  }
  return _prisma;
}

import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in dev (Next.js hot reload creates new module instances)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

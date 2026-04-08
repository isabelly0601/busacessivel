import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// ====================================================================
// 🔌 Prisma Client — Driver Nativo PostgreSQL
// ====================================================================
// Conexão direta Node.js → PostgreSQL sem binário intermediário.
// Vantagens: Melhor performance, suporte a PostGIS, sem binaryTargets.
// ====================================================================

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { pool };

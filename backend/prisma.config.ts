import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@database:5432/app_db?schema=public",
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});


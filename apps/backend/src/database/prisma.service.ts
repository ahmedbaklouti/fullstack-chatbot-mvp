import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pgPool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl || !databaseUrl.trim()) {
      throw new Error(
        'DATABASE_URL is required (set it in apps/backend/.env or apps/backend/.env.example)',
      );
    }

    // Prisma v7 requires either an adapter or Accelerate. For local Postgres, we use
    // the official driver adapter with a shared pg Pool managed by Nest lifecycle hooks.
    const pgPool = new Pool({
      connectionString: databaseUrl,
    });

    super({
      adapter: new PrismaPg(pgPool),
    });

    this.pgPool = pgPool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pgPool.end();
  }
}

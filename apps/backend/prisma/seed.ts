import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.example' });

const SEED_RULES = [
  {
    keywords: ['price', 'cost', 'pricing'],
    response: 'Our pricing starts at $9.99/month',
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    response: 'Hello! How can I assist you today?',
  },
  {
    keywords: ['help', 'support'],
    response: "I'm here to help. What can I do for you?",
  },
  {
    keywords: ['features', 'services'],
    response:
      'We offer various features including cloud storage, real-time sync, and 24/7 support',
  },
];

async function seedDatabase() {
  const databaseUrlEnv = process.env.DATABASE_URL;
  if (!databaseUrlEnv || !databaseUrlEnv.trim()) {
    throw new Error('DATABASE_URL is required');
  }

  const pgPool = new Pool({ connectionString: databaseUrlEnv });
  const prismaClient = new PrismaClient({
    adapter: new PrismaPg(pgPool),
  });

  try {
    const [, createManyResult] = await prismaClient.$transaction([
      prismaClient.rule.deleteMany(),
      prismaClient.rule.createMany({ data: SEED_RULES }),
    ]);

    console.log(`Seed completed. Inserted ${createManyResult.count} rules.`);
  } finally {
    await prismaClient.$disconnect();
    await pgPool.end();
  }
}

seedDatabase().catch((err) => {
  console.error('Seed failed');
  console.error(err);
  process.exitCode = 1;
});

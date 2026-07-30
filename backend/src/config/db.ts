import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma ORM connected successfully to Database');
  } catch (error) {
    console.error('❌ Failed to connect to Database via Prisma:', error);
    process.exit(1);
  }
}

// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Executes a database operation with exponential backoff retry for Neon cold-starts
 */
export async function withDbRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (retries <= 0) throw error;
    
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes("Can't reach database server") ||
        error.message.includes('connection timed out') ||
        error.message.includes('Connection closed') ||
        error.message.includes('Transaction already closed') ||
        error.message.includes('expired transaction') ||
        error.message.includes('timed out'));

    if (isConnectionError) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withDbRetry(operation, retries - 1, delayMs * 1.5);
    }

    throw error;
  }
}
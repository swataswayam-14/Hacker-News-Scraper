import { PrismaClient } from '@prisma/client';
import { config } from '../config/config.js';

export const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error']
});
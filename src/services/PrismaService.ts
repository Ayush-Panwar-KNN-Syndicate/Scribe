import { PrismaClient } from '../generated/prisma'

/**
 * Prisma Service - Database client singleton
 * Ensures single instance across the application
 */
class PrismaService {
  private static instance: PrismaClient | undefined

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient()
    }
    return PrismaService.instance
  }
}

// Export singleton instance
export const prisma = PrismaService.getInstance()

// Backward compatibility export
export default prisma


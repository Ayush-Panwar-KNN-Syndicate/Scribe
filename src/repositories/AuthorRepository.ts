import { prisma } from '@/services/PrismaService'
import type { Author } from '../generated/prisma'

export type CreateAuthorData = {
  email: string
  name: string
  avatar_url?: string | null
  bio?: string | null
}

/**
 * Author Repository - Handles all author database operations
 */
export class AuthorRepository {
  /**
   * Find all authors
   */
  async findAll(): Promise<Author[]> {
    return prisma.author.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
  }

  /**
   * Find author by ID
   */
  async findById(id: string): Promise<Author | null> {
    return prisma.author.findUnique({
      where: { id }
    })
  }

  /**
   * Find author by email
   */
  async findByEmail(email: string): Promise<Author | null> {
    return prisma.author.findUnique({
      where: { email }
    })
  }

  /**
   * Create new author
   */
  async create(data: CreateAuthorData): Promise<Author> {
    return prisma.author.create({
      data
    })
  }

  /**
   * Update author
   */
  async update(id: string, data: Partial<CreateAuthorData>): Promise<Author> {
    return prisma.author.update({
      where: { id },
      data
    })
  }

  /**
   * Update author by email
   */
  async updateByEmail(email: string, data: Partial<CreateAuthorData>): Promise<Author> {
    return prisma.author.update({
      where: { email },
      data
    })
  }

  /**
   * Delete author
   */
  async delete(id: string): Promise<Author> {
    return prisma.author.delete({
      where: { id }
    })
  }

  /**
   * Count total authors
   */
  async count(): Promise<number> {
    return prisma.author.count()
  }
}

// Singleton instance
export const authorRepository = new AuthorRepository()


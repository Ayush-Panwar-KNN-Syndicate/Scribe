import { prisma } from '@/services/PrismaService'
import type { Category } from '../generated/prisma'

export type CreateCategoryData = {
  name: string
  slug: string
  description?: string | null
}

/**
 * Category Repository - Handles all category database operations
 */
export class CategoryRepository {
  /**
   * Find all categories
   */
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id }
    })
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug }
    })
  }

  /**
   * Create new category
   */
  async create(data: CreateCategoryData): Promise<Category> {
    return prisma.category.create({
      data
    })
  }

  /**
   * Update category
   */
  async update(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data
    })
  }

  /**
   * Delete category
   */
  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id }
    })
  }

  /**
   * Count total categories
   */
  async count(): Promise<number> {
    return prisma.category.count()
  }
}

// Singleton instance
export const categoryRepository = new CategoryRepository()


import { prisma } from '@/services/PrismaService'
import type { Article, Author, Category } from '../generated/prisma'

export type ArticleWithRelations = Article & {
  author: Author
  category: Category | null
}

export type CreateArticleData = {
  title: string
  slug: string
  excerpt: string
  sections: any
  author_id: string
  category_id?: string | null
  image_id?: string | null
}

export type UpdateArticleData = Partial<CreateArticleData>

/**
 * Article Repository - Handles all article database operations
 */
export class ArticleRepository {
  /**
   * Find all articles with their relations
   */
  async findAll(): Promise<ArticleWithRelations[]> {
    return prisma.article.findMany({
      include: {
        author: true,
        category: true,
      },
      orderBy: {
        published_at: 'desc'
      }
    })
  }

  /**
   * Find article by ID
   */
  async findById(id: string): Promise<ArticleWithRelations | null> {
    return prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
      }
    })
  }

  /**
   * Find article by slug
   */
  async findBySlug(slug: string): Promise<ArticleWithRelations | null> {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
      }
    })
  }

  /**
   * Find articles by author
   */
  async findByAuthor(authorId: string): Promise<ArticleWithRelations[]> {
    return prisma.article.findMany({
      where: { author_id: authorId },
      include: {
        author: true,
        category: true,
      },
      orderBy: {
        published_at: 'desc'
      }
    })
  }

  /**
   * Create new article
   */
  async create(data: CreateArticleData): Promise<ArticleWithRelations> {
    return prisma.article.create({
      data: {
        ...data,
        published_at: new Date(),
      },
      include: {
        author: true,
        category: true,
      }
    })
  }

  /**
   * Update article
   */
  async update(id: string, data: UpdateArticleData): Promise<ArticleWithRelations> {
    return prisma.article.update({
      where: { id },
      data,
      include: {
        author: true,
        category: true,
      }
    })
  }

  /**
   * Delete article
   */
  async delete(id: string): Promise<Article> {
    return prisma.article.delete({
      where: { id }
    })
  }

  /**
   * Count total articles
   */
  async count(): Promise<number> {
    return prisma.article.count()
  }

  /**
   * Count articles by author
   */
  async countByAuthor(authorId: string): Promise<number> {
    return prisma.article.count({
      where: { author_id: authorId }
    })
  }
}

// Singleton instance
export const articleRepository = new ArticleRepository()


import { categoryRepository, type CreateCategoryData } from '@/repositories/CategoryRepository'

/**
 * Category Controller - Handles category business logic
 */
export class CategoryController {
  /**
   * Get all categories
   */
  async getAllCategories() {
    return categoryRepository.findAll()
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryData) {
    // Check if category with same slug already exists
    const existing = await categoryRepository.findBySlug(data.slug)
    if (existing) {
      throw new Error('Category with this slug already exists')
    }
    
    return categoryRepository.create(data)
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: Partial<CreateCategoryData>) {
    // If updating slug, check it doesn't conflict
    if (data.slug) {
      const existing = await categoryRepository.findBySlug(data.slug)
      if (existing && existing.id !== id) {
        throw new Error('Category with this slug already exists')
      }
    }
    
    return categoryRepository.update(id, data)
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string) {
    return categoryRepository.delete(id)
  }

  /**
   * Get category statistics
   */
  async getStatistics() {
    const count = await categoryRepository.count()
    return { totalCategories: count }
  }
}

// Singleton instance
export const categoryController = new CategoryController()


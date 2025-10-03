import { authService } from '@/services/AuthService'
import { AdminService } from '@/services/AdminService'
import type { Author } from '../generated/prisma'

/**
 * Auth Controller - Handles authentication and authorization
 */
export class AuthController {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<Author | null> {
    return authService.getCurrentUser()
  }

  /**
   * Require authentication
   */
  async requireAuth(): Promise<Author> {
    return authService.requireAuth()
  }

  /**
   * Check if user is admin
   */
  isAdmin(userEmail: string | null | undefined): boolean {
    return AdminService.isAdmin(userEmail)
  }

  /**
   * Require admin access
   */
  requireAdmin(userEmail: string | null | undefined): void {
    AdminService.requireAdmin(userEmail)
  }

  /**
   * Check if user can edit article
   */
  canEditArticle(article: { author_id: string }, currentUser: Author): boolean {
    // User can edit their own articles
    if (article.author_id === currentUser.id) {
      return true
    }
    
    // Admins can edit any article
    if (this.isAdmin(currentUser.email)) {
      return true
    }
    
    return false
  }

  /**
   * Check if user can delete article
   */
  canDeleteArticle(article: { author_id: string }, currentUser: Author): boolean {
    // Same rules as edit for now
    return this.canEditArticle(article, currentUser)
  }
}

// Singleton instance
export const authController = new AuthController()


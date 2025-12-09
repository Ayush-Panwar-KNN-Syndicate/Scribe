import { authService } from '@/services/AuthService'
import { isAdmin } from '@/lib/admin'
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
  // isAdmin():Promise<boolean> {
  //   const result =AdminService.isAdmin()
  //   return result;
  // }

  /**
   * Require admin access
   */
  // requireAdmin(userEmail: string | null | undefined): void {
  //   AdminService.requireAdmin(userEmail)
  // }

  /**
   * Check if user can edit article
   */
    async canEditArticle(article: { author_id: string }, currentUser: Author):Promise<boolean> {
    // User can edit their own articles
    if (article.author_id === currentUser.id) {
      return true
    }
    
    // Admins can edit any article

    const isAdmin_author = await isAdmin();
    if (isAdmin_author) {
      return true
    }
    
    return false
  }


  canDeleteArticle(article: { author_id: string }, currentUser: Author): Promise<boolean> {
    // Same rules as edit for now
    return  this.canEditArticle(article, currentUser)
  }
}


// Singleton instance
export const authController = new AuthController()


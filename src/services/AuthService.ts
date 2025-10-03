import { createClient } from '@/lib/supabase/server'
import { prisma } from './PrismaService'
import type { Author } from '../generated/prisma'

/**
 * Authentication Service - Handles user authentication and author management
 */
export class AuthService {
  /**
   * Get current authenticated user and their author record
   */
  async getCurrentUser(): Promise<Author | null> {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) return null

      // Find or create author record
      let author = await prisma.author.findUnique({
        where: { email: user.email }
      })

      if (!author) {
        author = await this.createAuthor(user)
      } else {
        author = await this.updateAuthorProfile(user, author)
      }

      return author
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      return null
    }
  }

  /**
   * Require authentication - throws error if not authenticated
   */
  async requireAuth(): Promise<Author> {
    const author = await this.getCurrentUser()
    if (!author) {
      throw new Error('Authentication required')
    }
    return author
  }

  /**
   * Create new author from user data
   */
  private async createAuthor(user: any): Promise<Author> {
    try {
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email.split('@')[0]

      const author = await prisma.author.create({
        data: {
          email: user.email,
          name: displayName,
          avatar_url: user.user_metadata?.avatar_url || 
                     user.user_metadata?.picture || 
                     null,
        }
      })
      
      console.log(`✅ Created new author: ${author.email}`)
      return author
    } catch (error) {
      console.error('Failed to create author:', error)
      // Try to find again (race condition)
      const author = await prisma.author.findUnique({
        where: { email: user.email }
      })
      if (!author) {
        throw new Error('Failed to create or find author record')
      }
      return author
    }
  }

  /**
   * Update author profile with latest OAuth data
   */
  private async updateAuthorProfile(user: any, author: Author): Promise<Author> {
    try {
      const updatedData: Partial<Author> = {}
      
      if (user.user_metadata?.full_name && user.user_metadata.full_name !== author.name) {
        updatedData.name = user.user_metadata.full_name
      }
      
      if (user.user_metadata?.avatar_url && user.user_metadata.avatar_url !== author.avatar_url) {
        updatedData.avatar_url = user.user_metadata.avatar_url
      }
      
      if (user.user_metadata?.picture && user.user_metadata.picture !== author.avatar_url) {
        updatedData.avatar_url = user.user_metadata.picture
      }
      
      if (Object.keys(updatedData).length > 0) {
        const updated = await prisma.author.update({
          where: { email: user.email },
          data: updatedData
        })
        console.log(`✅ Updated author profile: ${updated.email}`)
        return updated
      }
      
      return author
    } catch (error) {
      console.error('Failed to update author profile:', error)
      return author
    }
  }
}

// Singleton instance
export const authService = new AuthService()

// Backward compatibility exports
export const getCurrentUser = () => authService.getCurrentUser()
export const requireAuth = () => authService.requireAuth()


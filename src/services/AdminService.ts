/**
 * Admin Service - Handles admin access control and permissions
 */
export class AdminService {
  private static adminEmails: string[] | null = null

  /**
   * Get admin emails from environment variables
   */
  private static getAdminEmailsFromEnv(): string[] {
    const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS
    
    if (!adminEmailsEnv) {
      console.warn('⚠️ No ADMIN_EMAILS environment variable found. Admin access will be disabled.')
      return []
    }

    // Split by comma and clean up whitespace
    return adminEmailsEnv
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0)
  }

  /**
   * Get cached admin emails
   */
  private static getAdminEmails(): string[] {
    if (AdminService.adminEmails === null) {
      AdminService.adminEmails = AdminService.getAdminEmailsFromEnv()
    }
    return AdminService.adminEmails
  }

  /**
   * Check if an email is an admin email
   */
  public static isAdminEmail(email: string): boolean {
    const adminEmails = AdminService.getAdminEmails()
    if (!email || adminEmails.length === 0) return false
    return adminEmails.includes(email.toLowerCase())
  }

  /**
   * Check if the current user is an admin based on their email
   */
  public static isAdmin(userEmail: string | null | undefined): boolean {
    if (!userEmail) return false
    return AdminService.isAdminEmail(userEmail)
  }

  /**
   * Throw an error if the user is not an admin
   */
  public static requireAdmin(userEmail: string | null | undefined): void {
    if (!AdminService.isAdmin(userEmail)) {
      throw new Error('Admin access required. Contact your administrator if you need access.')
    }
  }

  /**
   * Get list of admin emails (for debugging/logging purposes only)
   */
  public static getAdminEmailsList(): string[] {
    return [...AdminService.getAdminEmails()]
  }

  /**
   * Get the count of configured admin emails
   */
  public static getAdminEmailCount(): number {
    return AdminService.getAdminEmails().length
  }
}

// Backward compatibility exports
export const isAdminEmail = AdminService.isAdminEmail.bind(AdminService)
export const isAdmin = AdminService.isAdmin.bind(AdminService)
export const requireAdmin = AdminService.requireAdmin.bind(AdminService)
export const getAdminEmails = AdminService.getAdminEmailsList.bind(AdminService)
export const getAdminEmailCount = AdminService.getAdminEmailCount.bind(AdminService)


/**
 * Admin utilities for restricting access to certain features
 * 
 * Admin users can:
 * - Access static pages management
 * - Edit any article (not just their own)
 * - View admin-only features throughout the application
 */

// Get admin emails from environment variables
function getAdminEmailsFromEnv(): string[] {
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

// Cache the admin emails to avoid re-parsing on every call
const ADMIN_EMAILS = getAdminEmailsFromEnv()

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  if (!email || ADMIN_EMAILS.length === 0) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Check if the current user is an admin based on their email
 */
export function isAdmin(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false
  return isAdminEmail(userEmail)
}

/**
 * Throw an error if the user is not an admin
 */
export function requireAdmin(userEmail: string | null | undefined): void {
  if (!isAdmin(userEmail)) {
    throw new Error('Admin access required. Contact your administrator if you need access.')
  }
}

/**
 * Get list of admin emails (for debugging/logging purposes only)
 * Note: Only use this in server-side code or secure environments
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS]
}

/**
 * Get the count of configured admin emails (safe for client-side)
 */
export function getAdminEmailCount(): number {
  return ADMIN_EMAILS.length
} 
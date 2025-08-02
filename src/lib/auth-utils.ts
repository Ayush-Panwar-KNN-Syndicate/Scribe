import { createClient as createBrowserClient } from '@/lib/supabase/client'

export type AuthError = {
  message: string
  type: 'error' | 'success' | 'warning'
}

export async function signOut() {
  try {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
    
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign out'
    }
  }
}

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred'
  
  const errorObj = error as { message?: string; error_description?: string; msg?: string }
  const message = errorObj.message || errorObj.error_description || errorObj.msg || 'Authentication failed'
  
  // Handle common OAuth errors
  switch (errorObj.message) {
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link before signing in.'
    case 'User already registered':
      return 'Account already exists. Please sign in.'
    default:
      return message.includes('OAuth') ? 'Authentication failed. Please try again.' : message
  }
} 
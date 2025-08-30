'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle(redirectTo: string = '/articles') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google OAuth error:', error)
    redirect(`/login?error=${encodeURIComponent('Failed to initiate Google sign-in. Please try again.')}`)
  }

  if (data.url) {
    redirect(data.url)
  }

  // Fallback if no URL is returned
  redirect(`/login?error=${encodeURIComponent('Failed to initiate Google sign-in. Please try again.')}`)
} 
 
 
 
 
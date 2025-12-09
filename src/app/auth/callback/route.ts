import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const { searchParams } = new URL(requestUrl)
  const code = searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/articles'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Email confirmation failed. Please try again.')}`)
      }
      
      // Success - redirect to intended destination with success message
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}?success=${encodeURIComponent('Email confirmed successfully! Welcome to Scribe.')}`)
      
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Email confirmation failed. Please try again.')}`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Invalid confirmation link. Please try again.')}`)
} 
 
 
 
 
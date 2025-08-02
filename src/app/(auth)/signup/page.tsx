'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Redirect to login since Google OAuth handles both login and signup
    const redirectTo = searchParams.get('redirectTo') || '/articles'
    const loginUrl = `/login${redirectTo !== '/articles' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
    router.replace(loginUrl)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to sign in...</p>
      </div>
    </div>
  )
} 
 
 
 
 
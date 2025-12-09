'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-utils'
import { LogOut, Loader2 } from 'lucide-react'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      const result = await signOut()
      
      if (result.success) {
        router.push('/login?success=Successfully signed out')
        router.refresh()
      } else {
        console.error('Logout error:', result.error)
        alert('Failed to sign out. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to sign out. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="w-full h-8 px-3 justify-start text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 font-normal transition-colors"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </>
      )}
    </Button>
  )
} 
 
 
 
 
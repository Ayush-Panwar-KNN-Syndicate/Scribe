
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import LogoutButton from '@/components/features/auth/LogoutButton'
import {
  FileText,
  Plus,
  Globe,
  Menu,
  User
} from 'lucide-react'

interface SidebarProps {
  author: {
    name: string | null
    email: string
    avatar_url: string | null
  } | null
  userEmail?: string
  isAdmin?:boolean
}

const navigation = [
  {
    name: 'Articles',
    href: '/articles',
    icon: FileText
  },
  {
    name: 'New Article',
    href: '/articles/new',
    icon: Plus
  },
  {
    name: 'Static Pages',
    href: '/static-pages',
    icon: Globe,
    adminOnly: true // Mark as admin-only
  }
]

function SidebarContent({ author, userEmail,isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Use effect to set mounted state after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const getUserDisplayName = () => {
    return author?.name || userEmail?.split('@')[0] || 'User'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Filter navigation items based on admin status, but only after mounting
  const currentUserEmail = author?.email || userEmail
  const filteredNavigation = mounted 
    ? navigation.filter(item => {
        if (item.adminOnly) {
          return isAdmin
        }
        return true
      })
    : navigation.filter(item => !item.adminOnly) // Show only non-admin items during SSR

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="font-semibold text-gray-900">Scribe</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/articles' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-gray-100">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            {author?.avatar_url && !imageError ? (
              <img 
                src={author.avatar_url} 
                alt={getUserDisplayName()}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {getUserDisplayName()}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {author?.email || userEmail}
            </div>
          </div>
        </div>
        
        {/* Logout */}
        <LogoutButton />
      </div>
    </div>
  )
}

export default function Sidebar({ author, userEmail,isAdmin }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 border border-gray-200 bg-white shadow-sm"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent author={author} userEmail={userEmail}  isAdmin={isAdmin} />
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col">
        <SidebarContent author={author} userEmail={userEmail} isAdmin={isAdmin} />
      </div>
    </>
  )
} 
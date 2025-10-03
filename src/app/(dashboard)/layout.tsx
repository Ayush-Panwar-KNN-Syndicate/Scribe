import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import Sidebar from '@/components/features/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get author information from Prisma
  const author = await getCurrentUser()

  return (
    <div className="h-screen bg-gray-50">
      <Sidebar author={author} userEmail={user.email} />
      
      {/* Mobile header spacer */}
      <div className="h-16 md:hidden" />
      
      {/* Main content area */}
      <main className="md:pl-64 h-full">
        <div className="px-6 py-8 h-full overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
} 
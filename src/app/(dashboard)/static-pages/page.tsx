'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Home,Loader2,BookOpen,AlertTriangle } from 'lucide-react'
import { staticArticles } from '@/data/staticArticles'
import { pages } from "@/data/staticPage";
import StaticArticleSection from './staticAticlesSection'
import StaticPagesection from './staticPageSection'
import { checkAdmin } from './actions'

const technicalDetails = [
  { title: "Performance", value: "Sub-200ms TTFB" },
  { title: "Cache Strategy", value: "7-day browser, 30-day edge" },
  { title: "CDN Distribution", value: "250+ Cloudflare locations" },
  { title: "Routing Method", value: "URL Rewrite Rules" },
];



export default function StaticPagesPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'pages' | 'articles'>('pages')
  // Admin access state
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  // ALL useEffect hooks must also be called in the same order, so move them here
  // Check admin access on component mount
  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !user.email) {
          router.push('/login')
          return
        }
        setUserEmail(user.email)
        const adminStatus = await checkAdmin();
        setIsAdminUser(adminStatus)
        if (!adminStatus) {
          // User is not admin, redirect them back to articles
          router.push('/articles?error=' + encodeURIComponent('Admin access required. Contact your administrator if you need access.'))
          return
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/articles?error=' + encodeURIComponent('Error verifying admin access'))
      } finally {
        setIsCheckingAdmin(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show access denied if user is not admin
  if (isAdminUser === false) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You do not have permission to access Static Content Management. This feature is restricted to administrators only.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Current user:</strong> {userEmail}
                </p>
                <p className="text-sm text-muted-foreground">
                  If you believe you should have access to this feature, please contact your administrator.
                </p>
              </div>
              
              <Button onClick={() => router.push('/articles')} className="w-full">
                Return to Articles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Static Content Management</h1>
          <p className="text-muted-foreground">
            Manage static pages and articles published to Cloudflare R2 with custom domain support
          </p>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('pages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'pages'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
          <Home className="w-4 h-4 inline-block mr-2" />
            Static Pages ({pages.length})
          </button>

          <button
            onClick={() => setSelectedTab('articles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'articles'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <BookOpen className="w-4 h-4 inline-block mr-2" />
            Static Articles ({staticArticles.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'pages' && (
        <StaticPagesection  isAdminUser={isAdminUser} isCheckingAdmin={isCheckingAdmin}/>
      )}

      {selectedTab === 'articles' && (
        <StaticArticleSection isAdminUser={isAdminUser} isCheckingAdmin={isCheckingAdmin}/>
      )}
      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {technicalDetails.map((item) => (
            <div key={item.title}>
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-muted-foreground">{item.value}</p>
            </div>
          ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
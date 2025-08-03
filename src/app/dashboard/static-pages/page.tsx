'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Home, Phone, Shield, Globe, Loader2, CheckCircle, XCircle, Upload, RefreshCw, Info, Trash2, FileText, BookOpen, Search, Users, BarChart3, Filter, AlertTriangle } from 'lucide-react'
import { publishHomepage, publishContactPage, publishPrivacyPage, publishAboutPage, publishTermsPage, publishArticlesPage, publishSearchPage, checkStaticPagesStatus, unpublishHomepage, unpublishAboutPage, unpublishContactPage, unpublishPrivacyPage, unpublishTermsPage, unpublishArticlesPage, unpublishSearchPage, publishStaticArticle, unpublishStaticArticle, publishAllStaticArticles, unpublishAllStaticArticles, checkStaticArticlesStatus } from './actions'
import { staticArticles } from '@/data/staticArticles'

interface PublishResult {
  page: string
  url: string
  success: boolean
}

interface PageStatus {
  published: boolean
  url: string
}

interface ArticleStatus {
  id: string
  title: string
  published: boolean
  url: string
  slug: string
}

interface BulkOperation {
  type: 'publish' | 'unpublish'
  inProgress: boolean
  completed: number
  total: number
  results: Array<{ id: string; success: boolean; url?: string; error?: string }>
}

export default function StaticPagesPage() {
  const router = useRouter()
  
  // Move all useState hooks to the top - they must always be called in the same order
  const [isPublishing, setIsPublishing] = useState<Record<string, boolean>>({})
  const [isUnpublishing, setIsUnpublishing] = useState<Record<string, boolean>>({})
  const [publishResults, setPublishResults] = useState<Record<string, PublishResult>>({})
  const [pageStatuses, setPageStatuses] = useState<Record<string, PageStatus>>({})
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [statusLastChecked, setStatusLastChecked] = useState<Date | null>(null)

  // Article management state
  const [articleStatuses, setArticleStatuses] = useState<ArticleStatus[]>([])
  const [isCheckingArticles, setIsCheckingArticles] = useState(false)
  const [articlesLastChecked, setArticlesLastChecked] = useState<Date | null>(null)
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null)
  const [selectedTab, setSelectedTab] = useState<'pages' | 'articles'>('pages')
  const [articleFilter, setArticleFilter] = useState<'all' | 'published' | 'unpublished'>('all')
  const [searchQuery, setSearchQuery] = useState('')

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
        const adminStatus = isAdmin(user.email)
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

  // Check R2 status on component mount - only when admin is verified
  useEffect(() => {
    if (isAdminUser === true && !isCheckingAdmin) {
      checkStatus()
      checkArticlesStatus()
    }
  }, [isAdminUser, isCheckingAdmin])

  // Show loading state while checking admin access
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
                  You don't have permission to access Static Content Management. This feature is restricted to administrators only.
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

  const checkStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const statuses = await checkStaticPagesStatus()
      setPageStatuses({
        homepage: statuses.homepage,
        about: statuses.about,
        contact: statuses.contact,
        privacy: statuses.privacy,
        terms: statuses.terms,
        articles: statuses.articles,
        search: statuses.search
      })
      setStatusLastChecked(new Date())
    } catch (error) {
      console.error('Failed to check page statuses:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const checkArticlesStatus = async () => {
    setIsCheckingArticles(true)
    try {
      const status = await checkStaticArticlesStatus()
      setArticleStatuses(status.articles)
      setArticlesLastChecked(new Date())
    } catch (error) {
      console.error('Failed to check article statuses:', error)
    } finally {
      setIsCheckingArticles(false)
    }
  }

  const handleBulkPublish = async () => {
    setBulkOperation({
      type: 'publish',
      inProgress: true,
      completed: 0,
      total: staticArticles.length,
      results: []
    })

    try {
      const result = await publishAllStaticArticles()
      
      setBulkOperation(prev => prev ? {
        ...prev,
        inProgress: false,
        completed: result.published,
        results: result.results
      } : null)

      // Refresh article statuses
      await checkArticlesStatus()
    } catch (error) {
      console.error('Bulk publish failed:', error)
      setBulkOperation(prev => prev ? { ...prev, inProgress: false } : null)
    }
  }

  const handleBulkUnpublish = async () => {
    setBulkOperation({
      type: 'unpublish',
      inProgress: true,
      completed: 0,
      total: staticArticles.length,
      results: []
    })

    try {
      const result = await unpublishAllStaticArticles()
      
      setBulkOperation(prev => prev ? {
        ...prev,
        inProgress: false,
        completed: result.unpublished,
        results: result.results
      } : null)

      // Refresh article statuses
      await checkArticlesStatus()
    } catch (error) {
      console.error('Bulk unpublish failed:', error)
      setBulkOperation(prev => prev ? { ...prev, inProgress: false } : null)
    }
  }

  const handlePublishArticle = async (articleId: string) => {
    setIsPublishing(prev => ({ ...prev, [articleId]: true }))
    
    try {
      await publishStaticArticle(articleId)
      await checkArticlesStatus()
    } catch (error) {
      console.error(`Failed to publish article ${articleId}:`, error)
    } finally {
      setIsPublishing(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const handleUnpublishArticle = async (articleId: string) => {
    setIsUnpublishing(prev => ({ ...prev, [articleId]: true }))
    
    try {
      await unpublishStaticArticle(articleId)
      await checkArticlesStatus()
    } catch (error) {
      console.error(`Failed to unpublish article ${articleId}:`, error)
    } finally {
      setIsUnpublishing(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const handlePublishPage = async (pageType: 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search') => {
    setIsPublishing(prev => ({ ...prev, [pageType]: true }))
    
    try {
      let result
      
      switch (pageType) {
        case 'homepage':
          result = await publishHomepage()
          break
        case 'about':
          result = await publishAboutPage()
          break
        case 'contact':
          result = await publishContactPage()
          break
        case 'privacy':
          result = await publishPrivacyPage()
          break
        case 'terms':
          result = await publishTermsPage()
          break
        case 'articles':
          result = await publishArticlesPage()
          break
        case 'search':
          result = await publishSearchPage()
          break
        default:
          throw new Error(`Unknown page type: ${pageType}`)
      }
      
      setPublishResults(prev => ({
        ...prev,
        [pageType]: {
          page: pageType,
          url: result.url,
          success: true
        }
      }))
      
      // Refresh status
      await checkStatus()
      
    } catch (error) {
      setPublishResults(prev => ({
        ...prev,
        [pageType]: {
          page: pageType,
          url: '',
          success: false
        }
      }))
      console.error(`Failed to publish ${pageType}:`, error)
    } finally {
      setIsPublishing(prev => ({ ...prev, [pageType]: false }))
    }
  }

  const handleUnpublishPage = async (pageType: 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search') => {
    setIsUnpublishing(prev => ({ ...prev, [pageType]: true }))
    
    try {
      switch (pageType) {
        case 'homepage':
          await unpublishHomepage()
          break
        case 'about':
          await unpublishAboutPage()
          break
        case 'contact':
          await unpublishContactPage()
          break
        case 'privacy':
          await unpublishPrivacyPage()
          break
        case 'terms':
          await unpublishTermsPage()
          break
        case 'articles':
          await unpublishArticlesPage()
          break
        case 'search':
          await unpublishSearchPage()
          break
        default:
          throw new Error(`Unknown page type: ${pageType}`)
      }
      
      // Refresh status
      await checkStatus()
      
    } catch (error) {
      console.error(`Failed to unpublish ${pageType}:`, error)
    } finally {
      setIsUnpublishing(prev => ({ ...prev, [pageType]: false }))
    }
  }

  const getStatusBadge = (pageType: string) => {
    const status = pageStatuses[pageType]
    const result = publishResults[pageType]
    
    // If we have R2 status, use that as the source of truth
    if (status) {
      return status.published 
        ? <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>
        : <Badge variant="outline">Not Published</Badge>
    }
    
    // Fallback to publish result if no R2 status yet
    if (!result) return <Badge variant="outline">Not Published</Badge>
    
    return result.success 
      ? <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>
      : <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
  }

  const getPageUrl = (pageType: string) => {
    const status = pageStatuses[pageType]
    if (status) return status.url
    
    const result = publishResults[pageType]
    return result?.url || ''
  }

  const isPagePublished = (pageType: string) => {
    const status = pageStatuses[pageType]
    return status?.published || false
  }

  // Filter articles based on search and status
  const filteredArticles = articleStatuses.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staticArticles.find(a => a.id === article.id)?.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = articleFilter === 'all' || 
                         (articleFilter === 'published' && article.published) ||
                         (articleFilter === 'unpublished' && !article.published)
    
    return matchesSearch && matchesFilter
  })

  const publishedCount = articleStatuses.filter(a => a.published).length
  const unpublishedCount = articleStatuses.length - publishedCount

  const pages = [
    {
      id: 'homepage',
      title: 'Homepage',
      description: 'Main landing page with hero section, featured articles, and site statistics',
      icon: Home,
      features: ['Hero Section', 'Featured Articles Grid', 'Site Statistics', 'SEO Optimized']
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Professional search interface with real-time results and progressive enhancement',
      icon: Search,
      features: ['Real-time Search', 'Progressive Enhancement', 'AdSense Integration', 'Mobile Optimized']
    },
    {
      id: 'articles',
      title: 'Articles', 
      description: 'Comprehensive articles listing page with search functionality and category browsing',
      icon: BookOpen,
      features: ['Article Search', 'Category Browse', 'Featured Articles', 'Responsive Grid']
    },
    {
      id: 'about',
      title: 'About Us', 
      description: 'Professional about page with team, mission, values, and company story',
      icon: Info,
      features: ['Mission & Story', 'Team Profiles', 'Company Values', 'Community Section']
    },
    {
      id: 'contact',
      title: 'Contact Us', 
      description: 'Professional contact page with form, contact information, and office details',
      icon: Phone,
      features: ['Contact Form', 'Contact Information', 'Office Location', 'Structured Data']
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'Comprehensive privacy policy with table of contents and legal compliance',
      icon: Shield,
      features: ['Table of Contents', 'GDPR Compliant', 'Legal Sections', 'Contact Information']
    },
    {
      id: 'terms',
      title: 'Terms of Use',
      description: 'Professional terms of service with comprehensive legal sections and user responsibilities',
      icon: FileText,
      features: ['Table of Contents', 'Legal Compliance', 'User Responsibilities', 'Service Terms']
    }
  ]

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
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={selectedTab === 'pages' ? checkStatus : checkArticlesStatus}
            disabled={isCheckingStatus || isCheckingArticles}
            className="min-w-[120px]"
          >
            {(isCheckingStatus || isCheckingArticles) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </>
            )}
          </Button>
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
            Static Pages ({Object.keys(pageStatuses).length})
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
        <>
          {/* Status Information */}
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Static pages are published to Cloudflare R2 with URL rewrite rules for custom domain routing. 
                  Status is checked against R2 as the source of truth.
                </span>
                {statusLastChecked && (
                  <span className="text-xs text-muted-foreground">
                    Last checked: {statusLastChecked.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Individual Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Card key={page.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <page.icon className="w-6 h-6 text-primary" />
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                    </div>
                    {getStatusBadge(page.id)}
                  </div>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {page.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    {isPagePublished(page.id) ? (
                      <Button
                        variant="destructive"
                        onClick={() => handleUnpublishPage(page.id as 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search')}
                        disabled={isUnpublishing[page.id]}
                        className="w-full"
                      >
                        {isUnpublishing[page.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Unpublishing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Unpublish {page.title}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePublishPage(page.id as 'homepage' | 'about' | 'contact' | 'privacy' | 'terms' | 'articles' | 'search')}
                        disabled={isPublishing[page.id]}
                        className="w-full"
                      >
                        {isPublishing[page.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Publish {page.title}
                          </>
                        )}
                      </Button>
                    )}
                    
                    {getPageUrl(page.id) && isPagePublished(page.id) && (
                      <a 
                        href={getPageUrl(page.id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-center"
                      >
                        <Button variant="outline" className="w-full" disabled={isPublishing[page.id] || isUnpublishing[page.id]}>
                          <Globe className="w-4 h-4 mr-2" />
                          View Live Page
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {selectedTab === 'articles' && (
        <>
          {/* Articles Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staticArticles.length}</div>
                <p className="text-xs text-muted-foreground">Available for publishing</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{publishedCount}</div>
                <p className="text-xs text-muted-foreground">Live on R2</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unpublished</CardTitle>
                <XCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">{unpublishedCount}</div>
                <p className="text-xs text-muted-foreground">Not published</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round((publishedCount / staticArticles.length) * 100)}%</div>
                <p className="text-xs text-muted-foreground">Published ratio</p>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleBulkPublish}
                  disabled={bulkOperation?.inProgress}
                  className="flex-1"
                >
                  {bulkOperation?.type === 'publish' && bulkOperation.inProgress ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing All... ({bulkOperation.completed}/{bulkOperation.total})
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Publish All {staticArticles.length} Articles
                    </>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleBulkUnpublish}
                  disabled={bulkOperation?.inProgress}
                  className="flex-1"
                >
                  {bulkOperation?.type === 'unpublish' && bulkOperation.inProgress ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unpublishing All... ({bulkOperation.completed}/{bulkOperation.total})
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Unpublish All Articles
                    </>
                  )}
                </Button>
              </div>
              
              {bulkOperation && !bulkOperation.inProgress && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium">
                    {bulkOperation.type === 'publish' ? 'Publish' : 'Unpublish'} operation completed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bulkOperation.completed} of {bulkOperation.total} articles processed successfully
                  </p>
                  {bulkOperation.results.some(r => !r.success) && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer">View failed operations</summary>
                      <div className="mt-2 space-y-1">
                        {bulkOperation.results
                          .filter(r => !r.success)
                          .map(result => (
                            <div key={result.id} className="text-xs text-red-500">
                              Article {result.id}: {result.error}
                            </div>
                          ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search articles by title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={articleFilter}
                    onChange={(e) => setArticleFilter(e.target.value as 'all' | 'published' | 'unpublished')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="all">All Articles</option>
                    <option value="published">Published Only</option>
                    <option value="unpublished">Unpublished Only</option>
                  </select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredArticles.length} of {staticArticles.length} articles
                {articlesLastChecked && (
                  <span className="ml-4">
                    Last checked: {articlesLastChecked.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => {
              const staticArticle = staticArticles.find(a => a.id === article.id)
              if (!staticArticle) return null

              return (
                <Card key={article.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {staticArticle.category}
                          </Badge>
                          {article.published ? (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Not Published
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {staticArticle.excerpt}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>By {staticArticle.author}</span>
                      <span>{staticArticle.readTime}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {article.published ? (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnpublishArticle(article.id)}
                            disabled={isUnpublishing[article.id]}
                            className="w-full"
                          >
                            {isUnpublishing[article.id] ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3 mr-1" />
                            )}
                            Unpublish
                          </Button>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              <Globe className="w-3 h-3 mr-1" />
                              View Live
                            </Button>
                          </a>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handlePublishArticle(article.id)}
                          disabled={isPublishing[article.id]}
                          className="w-full"
                        >
                          {isPublishing[article.id] ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3 mr-1" />
                          )}
                          Publish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredArticles.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || articleFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No articles are available for publishing'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium">Performance</h4>
              <p className="text-muted-foreground">Sub-200ms TTFB</p>
            </div>
            <div>
              <h4 className="font-medium">Cache Strategy</h4>
              <p className="text-muted-foreground">7-day browser, 30-day edge</p>
            </div>
            <div>
              <h4 className="font-medium">CDN Distribution</h4>
              <p className="text-muted-foreground">250+ Cloudflare locations</p>
            </div>
            <div>
              <h4 className="font-medium">Routing Method</h4>
              <p className="text-muted-foreground">URL Rewrite Rules</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
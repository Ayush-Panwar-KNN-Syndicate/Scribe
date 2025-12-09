import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Loader2, CheckCircle, XCircle, Upload, Trash2, BookOpen, Users, BarChart3, Filter, RefreshCw } from 'lucide-react';
import { staticArticles } from '@/data/staticArticles';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge'
import { checkStaticArticlesStatus, publishAllStaticArticles, publishStaticArticle, unpublishAllStaticArticles, unpublishStaticArticle } from './actions';
import { Button } from '@/components/ui/button';

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


export default function StaticArticleSection({
  isAdminUser,
  isCheckingAdmin
}: {
  isAdminUser: boolean | null;
  isCheckingAdmin: boolean | null;
}) {
  const [articleStatuses, setArticleStatuses] = useState<ArticleStatus[]>([]);
  const [isCheckingArticles, setIsCheckingArticles] = useState(false);
  const [articlesLastChecked, setArticlesLastChecked] = useState<Date | null>(null)
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUnpublishing, setIsUnpublishing] = useState<Record<string, boolean>>({})
  const [isPublishing, setIsPublishing] = useState<Record<string, boolean>>({})
  const [articleFilter, setArticleFilter] = useState<'all' | 'published' | 'unpublished'>('all')
  const publishedCount = articleStatuses.filter(a => a.published).length
  const unpublishedCount = articleStatuses.length - publishedCount;

  // Filter articles based on search and status
  const filteredArticles = articleStatuses.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staticArticles.find(a => a.id === article.id)?.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = articleFilter === 'all' ||
      (articleFilter === 'published' && article.published) ||
      (articleFilter === 'unpublished' && !article.published)

    return matchesSearch && matchesFilter
  })

  // Check R2 status on component mount - only when admin is verified
  useEffect(() => {
    if (isAdminUser && !isCheckingAdmin)
      checkArticlesStatus()
  }, [isAdminUser,isCheckingAdmin])

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
      await checkArticlesStatus()
    } catch (error) {
      console.error('Bulk unpublish failed:', error)
      setBulkOperation(prev => prev ? { ...prev, inProgress: false } : null)
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

  return (
    <>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={checkArticlesStatus}
          disabled={isCheckingArticles}
          className="min-w-[120px]"
        >
          {isCheckingArticles ? (
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
  )
}

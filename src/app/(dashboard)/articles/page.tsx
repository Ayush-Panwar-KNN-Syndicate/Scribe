import Link from 'next/link'
// import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { Article, ArticleSection } from '@/types/database'
import { getPublicUrl } from '@/lib/cloudflare'
// import ErrorMessage from '@/components/shared/ErrorMessage'
import { getCurrentUser } from '@/services/AuthService'
import { isAdmin } from '@/lib/admin'

async function getArticles(): Promise<Article[]> {
  try {
    // Fetch articles with category and author info
    const user  = await getCurrentUser();
    if(!user)
    {
      return [];
    }
    const isUserAdmin = await isAdmin()
    const articles = await prisma.article.findMany({
       where: isUserAdmin ? {}: {
        author_id: user?.id,
      }
    ,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    // Transform Prisma articles to match our Article type
    return articles.map((article: any): Article => ({
      ...article,
      sections: article.sections as ArticleSection[],
    }))
  }
  catch (error) {
    console.error('Failed to fetch articles:', error)
    return []
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">Manage your articles</p>
        </div>
        <Link href="/articles/new">
          <Button>Create Article</Button>
        </Link>
      </div>

      {/* Stats */}
      {articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CardDescription>Articles visible to readers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(articles.map(p => p.category_id).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(articles.reduce((total, article) =>
                  total + article.sections.reduce((sectionTotal, section) =>
                    sectionTotal + (section.content.split(' ').length / 100), 0
                  ), 0) / articles.length * 100) / 100}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Articles List */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">No articles yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Get started by creating your first article. You can write, edit, and publish articles with our structured editor.
              </p>
              <Link href="/articles/new">
                <Button>Create Your First Article</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {articles.map(article => {
            const publishedDate = article.published_at.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })

            // Generate clean public URL for all articles
            const cleanUrl = getPublicUrl(article.slug)
            return (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {article.category && (
                          <Badge variant="secondary" className="text-xs">
                            {article.category.name}
                          </Badge>
                        )}
                        <Badge variant="default" className="text-xs">
                          Published
                        </Badge>
                      </div>
                      <CardTitle className="text-xl leading-tight">
                        {article.title}
                      </CardTitle>
                      <p className="text-gray-600 line-clamp-2">{article.excerpt}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>{publishedDate}</span>
                        <span>•</span>
                        <span>{article.sections.length} sections</span>
                        <span>•</span>
                        <span>/{article.slug}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={cleanUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">View</Button>
                      </a>
                      <Link href={`/articles/${article.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 
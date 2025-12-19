import { Article, ArticleSection } from '@/types/database'
import { prisma } from '@/lib/prisma'
type CurrentUser = {
  id: string
  email: string
  role: 'admin' | 'author'
  name: string
  avatar: string | null
}
export default async function getUserDetails(): Promise<CurrentUser | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/current-user`,
    { cache: 'no-store' } // IMPORTANT
  )

  if (!res.ok) return null
  return res.json()
}
export async function getArticles(): Promise<Article[]> {
  try {
    const articles = await prisma.article.findMany({
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
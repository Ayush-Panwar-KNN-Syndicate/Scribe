import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'
import ArticleManager from '@/components/custom/ArticleManager'
import { ArticleSection } from '@/types/database'

interface EditArticlePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params
  
  // Get current user
  const author = await getCurrentUser()
  if (!author) {
    notFound()
  }

  // Fetch article data
  const article = await prisma.article.findFirst({
    where: {
      id: id,
      author_id: author.id
    },
    include: {
      category: true,
      author: true
    }
  })

  if (!article) {
    notFound()
  }

  // Convert article sections from JSON to ArticleSection array
  const sections = Array.isArray(article.sections) 
    ? article.sections as ArticleSection[]
    : []

  // Prepare initial data for the editor
  const initialData = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    image_id: article.image_id,
    category_id: article.category_id,
    sections: sections
  }

  return (
    <ArticleManager
      mode="edit"
      title="Edit Article"
      description="Make changes to your article"
      initialData={initialData}
      articleId={id}
    />
  )
} 
import ArticleManager from '@/components/features/articles/ArticleManager'

export default function NewArticlePage() {
  return (
    <ArticleManager
      mode="create"
      title="Create New Article"
      description="Write and publish your structured article"
    />
  )
} 
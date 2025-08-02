export type Author = {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  bio?: string | null
  created_at: Date
  updated_at: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  created_at: Date
  updated_at: Date
}

export type ArticleSection = {
  id: string
  order: number
  header: string
  content: string
}

export type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  image_id: string | null
  content_markdown?: string | null
  sections: ArticleSection[]
  author_id: string
  author?: Author
  category_id: string | null
  category?: Category | null
  published_at: Date
  created_at: Date
  updated_at: Date
}

// Type for rendering articles (with string published_at)
export type ArticleForRender = Omit<Article, 'published_at'> & {
  published_at: string
  author: Author
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Category } from '@/types/database'
import StructuredArticleEditor from './StructuredArticleEditor'
import type { ArticleData } from './StructuredArticleEditor'

interface ArticleManagerProps {
  mode: 'create' | 'edit'
  title: string
  description: string
  initialData?: Partial<ArticleData>
  articleId?: string // For edit mode
}

interface CategoryFromAPI {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export default function ArticleManager({
  mode,
  title,
  description,
  initialData,
  articleId
}: ArticleManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        const loadedCategories: Category[] = data.success 
          ? data.categories.map((cat: CategoryFromAPI) => ({
              ...cat,
              created_at: new Date(cat.created_at),
              updated_at: new Date(cat.updated_at)
            }))
          : []
        setCategories(loadedCategories)
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  // API call for creating categories
  const handleCreateCategory = async (name: string): Promise<Category> => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error('Failed to create category')
    }
    
    const newCategory: Category = {
      ...data.category,
      created_at: new Date(data.category.created_at),
      updated_at: new Date(data.category.updated_at)
    }
    
    // Add to local state
    setCategories(prev => [...prev, newCategory])
    return newCategory
  }

  // API call for publishing/updating articles
  const handlePublish = async (articleData: ArticleData): Promise<{ success: boolean; url: string }> => {
    if (!articleData.category_id) {
      throw new Error('Category is required')
    }
    
    const url = mode === 'edit' && articleId 
      ? `/api/articles/${articleId}` 
      : '/api/articles'
    
    const method = mode === 'edit' ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData),
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to publish article')
    }
    
    // Redirect to articles page after successful edit
    if (mode === 'edit') {
      router.push('/articles')
    }
    
    return { success: true, url: data.url }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <StructuredArticleEditor
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onPublish={handlePublish}
        initialData={initialData}
      />
    </div>
  )
} 
 
 
 
 
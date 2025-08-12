'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'
import { uploadHtmlToPublic, purgeCache, getPublicUrl } from '@/lib/cloudflare'
import { renderStructuredArticleHtml } from '@/lib/structured-renderer'
import { ArticleSection, Category } from '@/types/database'

export interface ArticleData {
  title: string
  slug: string
  excerpt: string
  image_id: string | null
  category_id: string | null
  sections: ArticleSection[]
}

export async function fetchCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    
    return { success: true, categories }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return { success: false, categories: [] }
  }
}

export async function createCategory(name: string) {
  const author = await getCurrentUser()
  if (!author) {
    return { success: false, category: null }
  }

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-')
    
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: null
      }
    })

    return { success: true, category }
  } catch (error) {
    console.error('Failed to create category:', error)
    return { success: false, category: null }
  }
}

// Wrapper function for category creation that returns the Category object
export async function createCategoryForManager(name: string): Promise<Category> {
  const result = await createCategory(name)
  if (result.success && result.category) {
    const newCategory: Category = {
      id: result.category.id,
      name: result.category.name,
      slug: result.category.slug,
      description: result.category.description,
      created_at: result.category.created_at,
      updated_at: result.category.updated_at
    }
    
    return newCategory
  }
  throw new Error('Failed to create category')
}

export async function updateArticle(articleId: string, articleData: ArticleData): Promise<{ success: boolean; url?: string }> {
  const author = await getCurrentUser()
  if (!author) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const userIsAdmin = isAdmin(author.email)

  try {
    console.log('📝 Updating article:', articleData.title)

    // 1. Update article in database using Prisma
    const article = await prisma.article.update({
      where: {
        id: articleId,
        ...(userIsAdmin ? {} : { author_id: author.id }) // Admin can edit any article
      },
      data: {
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        image_id: articleData.image_id,
        category_id: articleData.category_id,
        sections: articleData.sections as any,
      },
      include: {
        author: true,
        category: true,
      }
    })

    console.log(`✅ Article updated in database with ID: ${article.id}`)

    // 2. Generate and upload HTML to R2 (using structured renderer)
    const articleForRender = {
      ...article,
      sections: article.sections as ArticleSection[],
      published_at: article.published_at.toISOString(),
    }
    const html = await renderStructuredArticleHtml(articleForRender as any)
    
    // Upload to R2 with clean URL (no .html extension)
    await uploadHtmlToPublic(articleData.slug, html)
    console.log(`✅ Article HTML uploaded to R2: ${articleData.slug}`)

    // 3. Get public URL
    const publicUrl = getPublicUrl(articleData.slug)

    // 4. Purge CDN cache for immediate availability
    try {
      await purgeCache(publicUrl)
      console.log('✅ CDN cache purged successfully')
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed, but article was updated:', cacheError)
    }

    console.log(`🎉 Successfully updated article: ${article.title}`)
    console.log(`🔗 Public URL: ${publicUrl}`)

    // 5. Revalidate relevant pages
    revalidatePath('/articles')
    revalidatePath(`/articles/${articleId}/edit`)

    return { success: true, url: publicUrl }

  } catch (error) {
    console.error('Update error:', error)
    throw new Error('Failed to update article')
  }
}

// Wrapper function for article updating that matches ArticleManager interface
export async function updateArticleForManager(articleId: string, articleData: ArticleData): Promise<{ success: boolean; url: string }> {
  if (!articleData.category_id) {
    throw new Error('Category is required')
  }
  
  const result = await updateArticle(articleId, articleData)
  if (result.success && result.url) {
    return { success: true, url: result.url }
  }
  throw new Error('Failed to update article')
}

// Legacy function for backward compatibility (if needed)
export async function publishArticle(articleId: string) {
  // This function can be removed if not used elsewhere
  throw new Error('Use updateArticle instead - all articles are automatically published')
} 
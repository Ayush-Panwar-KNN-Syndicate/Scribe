'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'
import { uploadHtmlToPublic, purgeCache, getPublicUrl, ensureCSSFiles } from '@/lib/cloudflare'
import { renderStructuredArticleHtml } from '@/lib/structured-renderer'
import { ArticleSection } from '@/types/database'

export interface ArticleData {
  title: string
  slug: string
  excerpt: string
  category_id: string
  sections: ArticleSection[]
  image_id: string | null
}

export async function fetchCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return { success: true, categories }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return { success: false, categories: [] }
  }
}

export async function createCategory(name: string) {
  try {
    const author = await requireAuth()
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    })

    return { success: true, category }
  } catch (error) {
    console.error('Failed to create category:', error)
    return { success: false, category: null }
  }
}

export async function publishArticle(articleData: ArticleData, domain?: string): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()

  try {
    console.log(`📝 Publishing article: ${articleData.title} for domain: ${domain || 'default'}`)

    // Get domain config if provided
    const domainConfig = domain
      ? await prisma.domain.findUnique({
          where: { domain },
          select: {
            domain: true,
            siteName: true,
            tagline: true,
            email: true,
            r2Bucket: true,
            r2PublicUrl: true,
            apiUrl: true,
          },
        })
      : null

    const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME
    const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL

    // Ensure CSS files are available in R2
    await ensureCSSFiles(r2Bucket)

    // 1. Create article in database using Prisma (all articles are published)
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        image_id: articleData.image_id,
        category_id: articleData.category_id,
        sections: articleData.sections as any,
        author_id: author.id,
        domain: domain || 'topreserchtopics.com', // Save domain with article
        published_at: new Date(), // Always set published_at
      },
      include: {
        author: true,
        category: true,
      }
    })

    console.log(`✅ Article created in database with ID: ${article.id} for domain: ${article.domain}`)

    // 2. Generate and upload HTML to R2 (using structured renderer)
    const articleForRender = {
      ...article,
      sections: article.sections as ArticleSection[],
      published_at: article.published_at.toISOString(),
    }

    // Prepare domain config for renderer
    const rendererDomainConfig = domainConfig ? {
      domain: domainConfig.domain,
      siteName: domainConfig.siteName,
      r2PublicUrl: domainConfig.r2PublicUrl,
    } : undefined

    const html = await renderStructuredArticleHtml(articleForRender as any, rendererDomainConfig)

    // Upload to R2 with clean URL (no .html extension) to domain-specific bucket
    await uploadHtmlToPublic(articleData.slug, html, r2Bucket)
    console.log(`✅ Article HTML uploaded to R2 bucket: ${r2Bucket}/${articleData.slug}`)

    // 3. Get public URL from domain-specific URL
    const publicUrl = `${r2PublicUrl}/${articleData.slug}`

    // 4. Purge CDN cache for immediate availability
    try {
      await purgeCache(publicUrl)
      console.log('✅ CDN cache purged successfully')
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed, but article was published:', cacheError)
    }

    console.log(`🎉 Successfully published article: ${article.title}`)
    console.log(`🔗 Public URL: ${publicUrl}`)

    // 5. Notify channel attribution — only for articlespectrum.com
    if (article.domain === 'articlespectrum.com') {
      try {
        const channelAttributionUrl = process.env.CHANNEL_ATTRIBUTION_URL
        const channelAttributionSecret = process.env.CHANNEL_ATTRIBUTION_SECRET
        if (channelAttributionUrl && channelAttributionSecret) {
          const caRes = await fetch(`${channelAttributionUrl}/api/webhook/article-published`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': channelAttributionSecret,
            },
            body: JSON.stringify({
              articleId: article.slug,
              url: publicUrl,
              category: article.category?.name || null,
              publishedAt: article.published_at.toISOString(),
              domain: article.domain,
            }),
          })
          if (!caRes.ok && caRes.status !== 409) {
            const body = await caRes.json().catch(() => ({}))
            console.warn('Channel attribution webhook non-OK:', caRes.status, body)
          } else {
            console.log(`Channel attribution notified for article: ${article.slug}`)
          }
        }
      } catch (channelErr) {
        console.warn('Channel attribution webhook failed:', channelErr)
      }
    }

    // 6. Revalidate relevant pages
    revalidatePath('/articles')
    revalidatePath('/articles/new')

    return { success: true, url: publicUrl }

  } catch (error) {
    console.error('❌ Article publishing error:', error)
    throw new Error(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'
import { uploadHtmlToPublic, purgeCache, getPublicUrl, ensureCSSFiles } from '@/lib/cloudflare'
import { renderStructuredArticleHtml } from '@/lib/structured-renderer'
import { ArticleSection, ArticleForRender } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const author = await getCurrentUser()
    if (!author) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const articleData = await request.json()

    console.log('📝 Publishing article:', articleData.title)
    
    // Ensure CSS files are available in R2
    await ensureCSSFiles()

    // 1. Create article in database using Prisma (all articles are published)
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        image_id: articleData.image_id,
        category_id: articleData.category_id,
        sections: articleData.sections,
        author_id: author.id,
        published_at: new Date(), // Always set published_at
      },
      include: {
        author: true,
        category: true,
      }
    })

    console.log(`✅ Article created in database with ID: ${article.id}`)

    // 2. Generate and upload HTML to R2 (using structured renderer)
    const articleForRender: ArticleForRender = {
      ...article,
      sections: article.sections as ArticleSection[],
      published_at: article.published_at.toISOString(),
      author: article.author!
    }
    const html = await renderStructuredArticleHtml(articleForRender)
    
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
      console.warn('⚠️ Cache purge failed, but article was published:', cacheError)
    }

    console.log(`🎉 Successfully published article: ${article.title}`)
    console.log(`🔗 Public URL: ${publicUrl}`)

    return NextResponse.json({ success: true, url: publicUrl })

  } catch (error) {
    console.error('❌ Article publishing error:', error)
    return NextResponse.json(
      { error: 'Failed to publish article', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
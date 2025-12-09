import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'
import { uploadHtmlToPublic, purgeCache, getPublicUrl } from '@/lib/cloudflare'
import { renderStructuredArticleHtml } from '@/lib/structured-renderer'
import { ArticleSection, ArticleForRender } from '@/types/database'
import { isAdmin } from '@/lib/admin'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const author = await getCurrentUser()
    if (!author) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userIsAdmin =  await isAdmin()

    const articleData = await request.json()

    console.log('📝 Updating article:', articleData.title)

    // 1. Update article in database using Prisma
    const updateData: any = {
      title: articleData.title,
      slug: articleData.slug,
      excerpt: articleData.excerpt,
      category_id: articleData.category_id,
      sections: articleData.sections,
    }

    // Make image optional: only update if provided
    if (articleData.image_id) {
      updateData.image_id = articleData.image_id
    }

    const article = await prisma.article.update({
      where: {
        id: id,
        ...(userIsAdmin ? {} : { author_id: author.id }) // Admins can edit any article, others only their own
      },
      data: updateData,
      include: {
        author: true,
        category: true,
      }
    })

    console.log(`✅ Article updated in database with ID: ${article.id}`)

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
      console.warn('⚠️ Cache purge failed, but article was updated:', cacheError)
    }

    console.log(`🎉 Successfully updated article: ${article.title}`)
    console.log(`🔗 Public URL: ${publicUrl}`)

    return NextResponse.json({ success: true, url: publicUrl })

  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update article', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
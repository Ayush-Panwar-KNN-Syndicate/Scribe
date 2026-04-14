import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'
import { uploadHtmlToPublic, purgeCache, ensureCSSFiles } from '@/lib/cloudflare'
import { renderStructuredArticleHtml } from '@/lib/structured-renderer'
import { ArticleSection, ArticleForRender } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const author = await getCurrentUser()
    if (!author) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const articleData = await request.json()

    // Client fills fields via AI generator before publishing

    console.log('📝 Publishing article:', articleData.title, 'for domain:', articleData.domain || 'default')

    // Get domain config if provided
    const domainConfig = articleData.domain
      ? await prisma.domain.findUnique({
          where: { domain: articleData.domain },
          select: {
            domain: true,
            siteName: true,
            r2Bucket: true,
            r2PublicUrl: true,
          },
        })
      : null

    const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME
    const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL

    // Ensure CSS files are available in R2
    await ensureCSSFiles(r2Bucket)

    // 1. Create article in database using Prisma (all articles are published)
    const createData: any = {
      title: articleData.title,
      slug: articleData.slug,
      excerpt: articleData.excerpt,
      category_id: articleData.category_id,
      sections: articleData.sections,
      author_id: author.id,
      domain: articleData.domain || 'topreserchtopics.com', // Domain for multi-tenant
      published_at: new Date(), // Always set published_at
    }

    // Make image optional: only set if provided
    if(articleData.image_id) {
      createData.image_id = articleData.image_id;
    }

    const article = await prisma.article.create({
      data: createData,
      include: {
        author: true,
        category: true,
      }
    })

    console.log(`✅ Article created in database with ID: ${article.id} for domain: ${article.domain}`)

    // 2. Generate and upload HTML to R2 (using structured renderer)
    const articleForRender: ArticleForRender = {
      ...article,
      sections: article.sections as ArticleSection[],
      published_at: article.published_at.toISOString(),
      author: article.author!
    }

    // Prepare domain config for renderer
    const rendererDomainConfig = domainConfig ? {
      domain: domainConfig.domain,
      siteName: domainConfig.siteName,
      r2PublicUrl: domainConfig.r2PublicUrl,
    } : undefined

    const html = await renderStructuredArticleHtml(articleForRender, rendererDomainConfig)

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

    // 6. Optionally send to Google Apps Script for logging (if configured)
    try {
      const appsScriptUrl = process.env.GSHEETS_WEBAPP_URL
      if (appsScriptUrl && typeof appsScriptUrl === 'string') {
        // Compute creation/publish dates for Google Sheets logging
        const createdAt = article.published_at instanceof Date
          ? article.published_at
          : new Date(article.published_at)
        const createdAtISO = createdAt.toISOString()
        const createdAtYMD = createdAtISO.slice(0, 10) // YYYY-MM-DD
        // Build row values with DATE as first column for Sheets (backward compatible)
        const rowValues = [
          createdAtYMD,        // Date (YYYY-MM-DD) - FIRST COLUMN
          article.title,       // Title / Vertical Name
          publicUrl,           // URL
          'Campaign Published',// Status
          (articleData as any).account_name || 'AFS_01', // Account Name
          article.slug         // Slug / ID
        ]

        const payload = {
          verticalName: article.title,
          url: publicUrl,
          campaignStatus: 'Campaign Published',
          accountName: (articleData as any).account_name || 'AFS_01',
          sheetId: process.env.GSHEETS_SHEET_ID || undefined,
          // New fields for date column in Sheets
          createdAtISO,
          createdAtYMD,
          slug: article.slug,
          // New ordered row to enforce date-first column across tabs
          rowValues,
        }
        await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
    } catch (logErr) {
      console.warn('⚠️ Failed to log to Google Sheets:', logErr)
    }

    // 7. Notify channel attribution system to assign an idle channel
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
          }),
        })
        if (!caRes.ok && caRes.status !== 409) {
          const body = await caRes.json().catch(() => ({}))
          console.warn('🔴 Channel attribution webhook non-OK:', caRes.status, body)
        } else {
          console.log(`📡 Channel attribution notified for article: ${article.slug}`)
        }
      }
    } catch (channelErr) {
      console.warn('🔴 Channel attribution webhook failed:', channelErr)
    }

    return NextResponse.json({ success: true, url: publicUrl })

  } catch (error) {
    console.error('❌ Article publishing error:', error)
    return NextResponse.json(
      { error: 'Failed to publish article', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
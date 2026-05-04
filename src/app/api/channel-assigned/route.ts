'use strict'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadHtmlToPublic, purgeCache } from '@/lib/cloudflare'
import { renderStructuredArticleHtml } from '@/lib/structured-renderer'
import { ArticleSection, ArticleForRender } from '@/types/database'

// POST /api/channel-assigned
// Called by channel-attribution-v2 after assignment or expiry.
// Body: { articleSlug, channelId, domain }
//   channelId present  → article assigned, bake channel into HTML
//   channelId null     → article expired, clear channel from HTML
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-webhook-secret')
    if (!secret || secret !== process.env.CHANNEL_ATTRIBUTION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { articleSlug, channelId, domain } = body

    if (!articleSlug) {
      return NextResponse.json({ error: 'articleSlug is required' }, { status: 400 })
    }

    const articleDomain = domain || 'articlespectrum.com'
    const newChannelId = channelId || null  // null = clear (expiry case)

    // 1. Update channel_id on the article
    const article = await prisma.article.update({
      where: { slug_domain: { slug: articleSlug, domain: articleDomain } },
      data: { channel_id: newChannelId },
      include: { author: true, category: true },
    })

    // 2. Get domain config for re-render
    const domainConfig = await prisma.domain.findUnique({
      where: { domain: articleDomain },
      select: { domain: true, siteName: true, r2Bucket: true, r2PublicUrl: true },
    })

    const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME!
    const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL!

    // 3. Re-render HTML with updated channel_id baked in
    const articleForRender: ArticleForRender = {
      ...article,
      sections: article.sections as ArticleSection[],
      published_at: article.published_at.toISOString(),
      author: article.author!,
    }

    const rendererDomainConfig = domainConfig
      ? { domain: domainConfig.domain, siteName: domainConfig.siteName, r2PublicUrl: domainConfig.r2PublicUrl }
      : undefined

    const html = await renderStructuredArticleHtml(articleForRender, rendererDomainConfig)
    await uploadHtmlToPublic(article.slug, html, r2Bucket)

    // 4. Purge CDN cache so the new HTML is served immediately
    try {
      await purgeCache(`${r2PublicUrl}/${article.slug}`)
    } catch (_) {}

    // 5. Update Cloudflare KV so the Worker always redirects to the current channel_id.
    //    PUT when assigned, DELETE when expired/cleared.
    const cfApiToken = process.env.CF_API_TOKEN
    const cfKvNamespaceId = process.env.CF_KV_NAMESPACE_ID
    const cfAccountId = 'a14c93148d0115ba3ab3cd488c8c0b06'
    if (cfApiToken && cfKvNamespaceId) {
      try {
        const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/storage/kv/namespaces/${cfKvNamespaceId}/values/${article.slug}`
        if (newChannelId) {
          await fetch(kvUrl, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${cfApiToken}`, 'Content-Type': 'text/plain' },
            body: newChannelId,
          })
        } else {
          await fetch(kvUrl, { method: 'DELETE', headers: { Authorization: `Bearer ${cfApiToken}` } })
        }
      } catch (_) {}
    }

    const action = newChannelId ? `assigned channel ${newChannelId}` : 'channel cleared (expiry)'
    console.log(`[channel-assigned] ${articleSlug} — ${action}`)

    return NextResponse.json({ ok: true, articleSlug, channelId: newChannelId })

  } catch (error: any) {
    // Article not found is a soft error — CA may fire before Scribe creates the article
    if (error?.code === 'P2025') {
      console.warn(`[channel-assigned] Article not found: ${JSON.stringify(error?.meta)}`)
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    console.error('[channel-assigned] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

'use server'

import { requireAuth } from '@/lib/auth-prisma'
import { requireAdmin } from '@/lib/admin'
import { uploadHtmlToPublic, purgeCache, getPublicUrl, ensureCSSFiles, deleteFromR2 } from '@/lib/cloudflare'
import { renderHomepage, renderContactPage, renderPrivacyPage, renderAboutPage, renderTermsPage, renderArticlesPage, renderSearchPage, renderStaticArticle, type DomainConfig } from '@/lib/static-page-renderer'
import { staticArticles } from '@/data/staticArticles'
import { prisma } from '@/lib/prisma'

async function getDomainConfig(domain?: string): Promise<DomainConfig | null> {
  if (!domain) return null
  return prisma.domain.findUnique({
    where: { domain },
    select: { domain: true, siteName: true, tagline: true, email: true, r2Bucket: true, r2PublicUrl: true, apiUrl: true },
  })
}

async function publishPage(
  key: string,
  renderFn: (config?: DomainConfig) => Promise<string>,
  domain?: string
): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME
  const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL

  await ensureCSSFiles(r2Bucket)

  const html = await renderFn(domainConfig || undefined)
  await uploadHtmlToPublic(key, html, r2Bucket)

  const publicUrl = key === 'index' ? `${r2PublicUrl}/` : `${r2PublicUrl}/${key}`

  try {
    await purgeCache(publicUrl)
  } catch {
    // cache purge failure is non-fatal
  }

  return { success: true, url: publicUrl }
}

async function unpublishPage(key: string, domain?: string): Promise<{ success: boolean }> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME

  await deleteFromR2(key, r2Bucket)

  return { success: true }
}

export async function publishHomepage(domain?: string) {
  return publishPage('index', renderHomepage, domain)
}

export async function publishAboutPage(domain?: string) {
  return publishPage('about', renderAboutPage, domain)
}

export async function publishContactPage(domain?: string) {
  return publishPage('contact', renderContactPage, domain)
}

export async function publishPrivacyPage(domain?: string) {
  return publishPage('privacy', renderPrivacyPage, domain)
}

export async function publishTermsPage(domain?: string) {
  return publishPage('terms', renderTermsPage, domain)
}

export async function publishArticlesPage(domain?: string) {
  return publishPage('articles', renderArticlesPage, domain)
}

export async function publishSearchPage(domain?: string) {
  return publishPage('search', renderSearchPage, domain)
}

export async function unpublishHomepage(domain?: string) {
  return unpublishPage('index', domain)
}

export async function unpublishAboutPage(domain?: string) {
  return unpublishPage('about', domain)
}

export async function unpublishContactPage(domain?: string) {
  return unpublishPage('contact', domain)
}

export async function unpublishPrivacyPage(domain?: string) {
  return unpublishPage('privacy', domain)
}

export async function unpublishTermsPage(domain?: string) {
  return unpublishPage('terms', domain)
}

export async function unpublishArticlesPage(domain?: string) {
  return unpublishPage('articles', domain)
}

export async function unpublishSearchPage(domain?: string) {
  return unpublishPage('search', domain)
}

export async function checkStaticPagesStatus(domain?: string): Promise<{
  homepage: { published: boolean; url: string }
  about: { published: boolean; url: string }
  contact: { published: boolean; url: string }
  privacy: { published: boolean; url: string }
  terms: { published: boolean; url: string }
  articles: { published: boolean; url: string }
  search: { published: boolean; url: string }
}> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME
  const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL

  const { HeadObjectCommand, S3Client } = await import('@aws-sdk/client-s3')

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })

  async function fileExists(key: string): Promise<boolean> {
    try {
      await r2Client.send(new HeadObjectCommand({ Bucket: r2Bucket!, Key: key }))
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) return false
      throw error
    }
  }

  const [homepageExists, aboutExists, contactExists, privacyExists, termsExists, articlesExists, searchExists] =
    await Promise.allSettled([
      fileExists('index'),
      fileExists('about'),
      fileExists('contact'),
      fileExists('privacy'),
      fileExists('terms'),
      fileExists('articles'),
      fileExists('search'),
    ])

  const url = (key: string) => key === 'index' ? `${r2PublicUrl}/` : `${r2PublicUrl}/${key}`
  const val = (r: PromiseSettledResult<boolean>) => r.status === 'fulfilled' ? r.value : false

  return {
    homepage: { published: val(homepageExists), url: url('index') },
    about: { published: val(aboutExists), url: url('about') },
    contact: { published: val(contactExists), url: url('contact') },
    privacy: { published: val(privacyExists), url: url('privacy') },
    terms: { published: val(termsExists), url: url('terms') },
    articles: { published: val(articlesExists), url: url('articles') },
    search: { published: val(searchExists), url: url('search') },
  }
}

export async function publishStaticArticle(articleId: string, domain?: string): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const article = staticArticles.find(a => a.id === articleId)
  if (!article) throw new Error(`Article ${articleId} not found`)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME
  const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL

  await ensureCSSFiles(r2Bucket)

  const html = await renderStaticArticle(articleId, domainConfig || undefined)
  await uploadHtmlToPublic(article.slug, html, r2Bucket)

  const publicUrl = `${r2PublicUrl}/${article.slug}`

  try {
    await purgeCache(publicUrl)
  } catch {
    // non-fatal
  }

  return { success: true, url: publicUrl }
}

export async function unpublishStaticArticle(articleId: string, domain?: string): Promise<{ success: boolean }> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const article = staticArticles.find(a => a.id === articleId)
  if (!article) throw new Error(`Article ${articleId} not found`)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME

  await deleteFromR2(article.slug, r2Bucket)

  return { success: true }
}

export async function publishAllStaticArticles(domain?: string): Promise<{
  success: boolean
  published: number
  failed: number
  results: Array<{ id: string; success: boolean; url?: string; error?: string }>
}> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME
  const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL

  await ensureCSSFiles(r2Bucket)

  const results = []
  let published = 0
  let failed = 0

  const batchSize = 5
  for (let i = 0; i < staticArticles.length; i += batchSize) {
    const batch = staticArticles.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (article) => {
        try {
          const html = await renderStaticArticle(article.id, domainConfig || undefined)
          await uploadHtmlToPublic(article.slug, html, r2Bucket)
          published++
          return { id: article.id, success: true, url: `${r2PublicUrl}/${article.slug}` }
        } catch (error) {
          failed++
          return { id: article.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      })
    )

    results.push(...batchResults)

    if (i + batchSize < staticArticles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return { success: failed === 0, published, failed, results }
}

export async function unpublishAllStaticArticles(domain?: string): Promise<{
  success: boolean
  unpublished: number
  failed: number
  results: Array<{ id: string; success: boolean; error?: string }>
}> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME

  const results = []
  let unpublished = 0
  let failed = 0

  const batchSize = 10
  for (let i = 0; i < staticArticles.length; i += batchSize) {
    const batch = staticArticles.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (article) => {
        try {
          await deleteFromR2(article.slug, r2Bucket)
          unpublished++
          return { id: article.id, success: true }
        } catch (error) {
          failed++
          return { id: article.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      })
    )

    results.push(...batchResults)

    if (i + batchSize < staticArticles.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return { success: failed === 0, unpublished, failed, results }
}

export async function checkStaticArticlesStatus(domain?: string): Promise<{
  total: number
  published: number
  unpublished: number
  articles: Array<{ id: string; title: string; published: boolean; url: string; slug: string }>
}> {
  const author = await requireAuth()
  requireAdmin(author.email)

  const domainConfig = await getDomainConfig(domain)
  const r2Bucket = domainConfig?.r2Bucket || process.env.R2_BUCKET_NAME
  const r2PublicUrl = domainConfig?.r2PublicUrl || process.env.R2_PUBLIC_URL

  const { HeadObjectCommand, S3Client } = await import('@aws-sdk/client-s3')

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })

  async function fileExists(key: string): Promise<boolean> {
    try {
      await r2Client.send(new HeadObjectCommand({ Bucket: r2Bucket!, Key: key }))
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) return false
      throw error
    }
  }

  const allResults = []
  const batchSize = 20

  for (let i = 0; i < staticArticles.length; i += batchSize) {
    const batch = staticArticles.slice(i, i + batchSize)

    const batchResults = await Promise.allSettled(
      batch.map(async (article) => {
        const exists = await fileExists(article.slug)
        return {
          id: article.id,
          title: article.title,
          published: exists,
          url: `${r2PublicUrl}/${article.slug}`,
          slug: article.slug,
        }
      })
    )

    allResults.push(
      ...batchResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value)
    )

    if (i + batchSize < staticArticles.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  const publishedCount = allResults.filter(a => a.published).length

  return {
    total: staticArticles.length,
    published: publishedCount,
    unpublished: allResults.length - publishedCount,
    articles: allResults,
  }
}

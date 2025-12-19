'use server'

import { requireAuth } from '@/lib/auth-prisma'
import { isAdmin } from '@/lib/admin'
import { getCurrentUser } from '@/lib/auth-prisma'
// import { requireAdmin } from '@/lib/admin'
import { uploadHtmlToPublic, purgeCache, getPublicUrl, ensureCSSFiles, deleteFromR2 } from '@/lib/cloudflare'
// import { renderHomepage, renderContactPage, renderPrivacyPage, renderAboutPage, renderTermsPage, renderArticlesPage, renderSearchPage, renderStaticArticle } from '@/lib/static-page-renderer'

import { renderHomepage } from '@/components/staticPages/renderHomepage'
import { renderContactPage } from '@/components/staticPages/renderContactPage'
import { renderPrivacyPage } from '@/components/staticPages/renderPrivacyPage'
import { renderAboutPage } from '@/components/staticPages/renderAboutPage'
import { renderTermsPage } from '@/components/staticPages/renderTermsPage'
import { renderArticlesPage } from '@/components/staticPages/renderArticlesPage'
import { renderSearchPage } from '@/components/staticPages/renderSearchPage'
import { renderStaticArticle } from '@/components/staticPages/renderStaticArticle'
import { staticArticles } from '@/data/staticArticles'



/**
 * Publish Homepage to Cloudflare R2
 */


export async function checkAdmin(): Promise<boolean> {
  try {
      const author = await getCurrentUser()
      if (!author) {
        console.log("user not found");
      }
    const isAdminUser = await isAdmin(author?.role);
    return isAdminUser === true;
  } catch (error: any) {
    throw new Error(`User is not authorized: ${error?.message || error}`);
  }
}


export async function publishpage(): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  // requireAdmin(author.email) // Admin check
  try {
    console.log('🏠 Publishing static page...')
    await ensureCSSFiles()
    // Generate homepage HTML
    const html = await renderHomepage()
    console.log('✅ Homepage HTML generated')
    // Upload to R2 as 'index' for custom domain + URL rewrite rules
    // URL rewrite rule will handle / -> /index automatically
    await uploadHtmlToPublic('index', html)
    console.log('✅ Homepage uploaded to R2: index')
    // Get public URL (root URL with custom domain + rewrite rules)
    const publicUrl = `${process.env.R2_PUBLIC_URL}/`
    // Purge CDN cache for both root and index paths
    try {
      await purgeCache([publicUrl, `${process.env.R2_PUBLIC_URL}/index`])
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }
    console.log('🎉 Successfully published homepage')
    console.log(`🔗 URL: ${publicUrl}`)
    return { 
      success: true, 
      url: publicUrl
    }
  } catch (error) {
    console.error('❌ Homepage publishing error:', error)
    throw new Error(`Failed to publish homepage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function publishHomepage(): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🏠 Publishing homepage...')
    
    // Ensure CSS files are cached
    await ensureCSSFiles()
    
    // Generate homepage HTML
    const html = await renderHomepage()
    console.log('✅ Homepage HTML generated')

    // Upload to R2 as 'index' for custom domain + URL rewrite rules
    // URL rewrite rule will handle / -> /index automatically
    await uploadHtmlToPublic('index', html)
    console.log('✅ Homepage uploaded to R2: index')

    // Get public URL (root URL with custom domain + rewrite rules)
    const publicUrl = `${process.env.R2_PUBLIC_URL}/`

    // Purge CDN cache for both root and index paths
    try {
      await purgeCache([publicUrl, `${process.env.R2_PUBLIC_URL}/index`])
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully published homepage')
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error('❌ Homepage publishing error:', error)
    throw new Error(`Failed to publish homepage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Publish About page to Cloudflare R2
 */
export async function publishAboutPage(): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('ℹ️ Publishing about page...')
    // Ensure CSS files are cached
    await ensureCSSFiles()
    // Generate about page HTML
    const html = await renderAboutPage()
    console.log('✅ About page HTML generated')

    // Upload to R2
    await uploadHtmlToPublic('about', html)
    console.log('✅ About page uploaded to R2: about')

    // Get public URL
    const publicUrl = getPublicUrl('about')

    // Purge CDN cache
    try {
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully published about page')
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error('❌ About page publishing error:', error)
    throw new Error(`Failed to publish about page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Publish Contact page to Cloudflare R2
 */
export async function publishContactPage(): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('📞 Publishing contact page...')
    
    // Ensure CSS files are cached
    await ensureCSSFiles()
    
    // Generate contact page HTML
    const html = await renderContactPage()
    console.log('✅ Contact page HTML generated')

    // Upload to R2
    await uploadHtmlToPublic('contact', html)
    console.log('✅ Contact page uploaded to R2: contact')

    // Get public URL
    const publicUrl = getPublicUrl('contact')

    // Purge CDN cache
    try {
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully published contact page')
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error('❌ Contact page publishing error:', error)
    throw new Error(`Failed to publish contact page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Publish Privacy Policy page to Cloudflare R2
 */
export async function publishPrivacyPage(): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🔒 Publishing privacy policy...')
    
    // Ensure CSS files are cached
    await ensureCSSFiles()
    
    // Generate privacy page HTML
    const html = await renderPrivacyPage()
    console.log('✅ Privacy policy HTML generated')

    // Upload to R2
    await uploadHtmlToPublic('privacy', html)
    console.log('✅ Privacy policy uploaded to R2: privacy')

    // Get public URL
    const publicUrl = getPublicUrl('privacy')

    // Purge CDN cache
    try {
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully published privacy policy')
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error('❌ Privacy policy publishing error:', error)
    throw new Error(`Failed to publish privacy policy: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Publish Terms of Use page to Cloudflare R2
 */
export async function publishTermsPage(): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('📜 Publishing terms of use...')
    
    // Ensure CSS files are cached
    await ensureCSSFiles()
    
    // Generate terms page HTML
    const html = await renderTermsPage()
    console.log('✅ Terms of use HTML generated')

    // Upload to R2
    await uploadHtmlToPublic('terms', html)
    console.log('✅ Terms of use uploaded to R2: terms')

    // Get public URL
    const publicUrl = getPublicUrl('terms')

    // Purge CDN cache
    try {
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully published terms of use')
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error('❌ Terms of use publishing error:', error)
    throw new Error(`Failed to publish terms of use: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Publish Articles page to Cloudflare R2
 */
export async function publishArticlesPage(): Promise<{ success: boolean; url: string }> {
  const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('📚 Publishing articles page...')
    
    // Ensure CSS files are cached
    await ensureCSSFiles()
    
    // Generate articles page HTML
    const html = await renderArticlesPage()
    console.log('✅ Articles page HTML generated')

    // Upload to R2
    await uploadHtmlToPublic('articles', html)
    console.log('✅ Articles page uploaded to R2: articles')

    // Get public URL
    const publicUrl = getPublicUrl('articles')

    // Purge CDN cache
    try {
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully published articles page')
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error('❌ Articles page publishing error:', error)
    throw new Error(`Failed to publish articles page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Publish Search page to Cloudflare R2
 */
export async function publishSearchPage(): Promise<{ success: boolean; url: string }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🔍 Publishing search page...')
    
    // Ensure CSS files are cached
    await ensureCSSFiles()
    
    // Generate search page HTML
    const html = await renderSearchPage()
    console.log('✅ Search page HTML generated')

    // Upload to R2
    await uploadHtmlToPublic('search', html)
    console.log('✅ Search page uploaded to R2: search')

    // Get public URL
    const publicUrl = getPublicUrl('search')

    // Purge CDN cache
    try {
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully published search page')
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error('❌ Search page publishing error:', error)
    throw new Error(`Failed to publish search page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check R2 to see which static pages are already published
 * This is the source of truth for publish status
 */
export async function checkStaticPagesStatus(): Promise<{
  homepage: { published: boolean; url: string }
  about: { published: boolean; url: string }
  contact: { published: boolean; url: string }
  privacy: { published: boolean; url: string }
  terms: { published: boolean; url: string }
  articles: { published: boolean; url: string }
  search: { published: boolean; url: string }
}> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    // Import the file check function here to avoid circular imports
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

    async function fileExistsInR2(key: string): Promise<boolean> {
      try {
        const command = new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        })
        
        await r2Client.send(command)
        return true
      } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          return false
        }
        throw error
      }
    }

    // Check all static pages in parallel
    const [homepageExists, aboutExists, contactExists, privacyExists, termsExists, articlesExists, searchExists] = await Promise.allSettled([
      fileExistsInR2('index'),
      fileExistsInR2('about'), 
      fileExistsInR2('contact'),
      fileExistsInR2('privacy'),
      fileExistsInR2('terms'),
      fileExistsInR2('articles'),
      fileExistsInR2('search')
    ])

    return {
      homepage: {
        published: homepageExists.status === 'fulfilled' ? homepageExists.value : false,
        url: `${process.env.R2_PUBLIC_URL}/`
      },
      about: {
        published: aboutExists.status === 'fulfilled' ? aboutExists.value : false,
        url: getPublicUrl('about')
      },
      contact: {
        published: contactExists.status === 'fulfilled' ? contactExists.value : false,
        url: getPublicUrl('contact')
      },
      privacy: {
        published: privacyExists.status === 'fulfilled' ? privacyExists.value : false,
        url: getPublicUrl('privacy')
      },
      terms: {
        published: termsExists.status === 'fulfilled' ? termsExists.value : false,
        url: getPublicUrl('terms')
      },
      articles: {
        published: articlesExists.status === 'fulfilled' ? articlesExists.value : false,
        url: getPublicUrl('articles')
      },
      search: {
        published: searchExists.status === 'fulfilled' ? searchExists.value : false,
        url: getPublicUrl('search')
      }
    }

  } catch (error) {
    console.error('Failed to check static pages status:', error)
    throw new Error('Failed to check page status')
  }
} 

/**
 * Unpublish Homepage from Cloudflare R2
 */
export async function unpublishHomepage(): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🗑️ Unpublishing homepage...')
    
    // Delete homepage file (index)
    await deleteFromR2('index')
    console.log('✅ Homepage unpublished from R2')
    
    return { success: true }

  } catch (error) {
    console.error('❌ Homepage unpublishing error:', error)
    throw new Error(`Failed to unpublish homepage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Unpublish About page from Cloudflare R2
 */
export async function unpublishAboutPage(): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🗑️ Unpublishing about page...')
    
    await deleteFromR2('about')
    console.log('✅ About page unpublished from R2')
    
    return { success: true }

  } catch (error) {
    console.error('❌ About page unpublishing error:', error)
    throw new Error(`Failed to unpublish about page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Unpublish Contact page from Cloudflare R2
 */
export async function unpublishContactPage(): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🗑️ Unpublishing contact page...')
    
    await deleteFromR2('contact')
    console.log('✅ Contact page unpublished from R2')
    
    return { success: true }

  } catch (error) {
    console.error('❌ Contact page unpublishing error:', error)
    throw new Error(`Failed to unpublish contact page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Unpublish Privacy Policy page from Cloudflare R2
 */
export async function unpublishPrivacyPage(): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🗑️ Unpublishing privacy policy...')
    
    await deleteFromR2('privacy')
    console.log('✅ Privacy policy unpublished from R2')
    
    return { success: true }

  } catch (error) {
    console.error('❌ Privacy policy unpublishing error:', error)
    throw new Error(`Failed to unpublish privacy policy: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Unpublish Terms of Use page from Cloudflare R2
 */
export async function unpublishTermsPage(): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🗑️ Unpublishing terms of use...')
    
    await deleteFromR2('terms')
    console.log('✅ Terms of use unpublished from R2')
    
    return { success: true }

  } catch (error) {
    console.error('❌ Terms of use unpublishing error:', error)
    throw new Error(`Failed to unpublish terms of use: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Unpublish Articles page from Cloudflare R2
 */
export async function unpublishArticlesPage(): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log('🗑️ Unpublishing articles page...')
    
    await deleteFromR2('articles')
    console.log('✅ Articles page unpublished from R2')
    
    return { success: true }

  } catch (error) {
    console.error('❌ Articles page unpublishing error:', error)
    throw new Error(`Failed to unpublish articles page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 

/**
 * Unpublish Search page from Cloudflare R2
 */
export async function unpublishSearchPage(): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check
  try {
    console.log('🗑️ Unpublishing search page...')
    
    // Delete from R2
    await deleteFromR2('search')
    console.log('✅ Search page deleted from R2')

    // Purge CDN cache
    try {
      const publicUrl = getPublicUrl('search')
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log('🎉 Successfully unpublished search page')
    
    return { success: true }

  } catch (error) {
    console.error('❌ Search page unpublishing error:', error)
    throw new Error(`Failed to unpublish search page: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 

/**
 * Publish a single static article to Cloudflare R2
 */
export async function publishStaticArticle(articleId: string): Promise<{ success: boolean; url: string }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check
  try {
    console.log(`📝 Publishing static article ${articleId}...`)
    const article = staticArticles.find(a => a.id === articleId)
    if (!article) {
      throw new Error(`Article with id ${articleId} not found`)
    }
    
    // Ensure CSS files are cached
    await ensureCSSFiles()
    
    // Generate article HTML
    const html = await renderStaticArticle(articleId)
    console.log(`✅ Article ${articleId} HTML generated`)

    // Upload to R2 with just the article slug (no 'articles/' prefix)
    const key = article.slug
    await uploadHtmlToPublic(key, html)
    console.log(`✅ Article ${articleId} uploaded to R2: ${key}`)

    // Get public URL
    const publicUrl = getPublicUrl(key)

    // Purge CDN cache
    try {
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log(`🎉 Successfully published article ${articleId}`)
    console.log(`🔗 URL: ${publicUrl}`)
    
    return { 
      success: true, 
      url: publicUrl
    }

  } catch (error) {
    console.error(`❌ Article ${articleId} publishing error:`, error)
    throw new Error(`Failed to publish article ${articleId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Unpublish a single static article from Cloudflare R2
 */
export async function unpublishStaticArticle(articleId: string): Promise<{ success: boolean }> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log(`🗑️ Unpublishing static article ${articleId}...`)
    
    // Find the article
    const article = staticArticles.find(a => a.id === articleId)
    if (!article) {
      throw new Error(`Article with id ${articleId} not found`)
    }
    
    // Delete from R2 using just the slug (no 'articles/' prefix)
    const key = article.slug
    await deleteFromR2(key)
    console.log(`✅ Article ${articleId} deleted from R2`)

    // Purge CDN cache
    try {
      const publicUrl = getPublicUrl(key)
      await purgeCache(publicUrl)
    } catch (cacheError) {
      console.warn('⚠️ Cache purge failed:', cacheError)
    }

    console.log(`🎉 Successfully unpublished article ${articleId}`)
    
    return { success: true }

  } catch (error) {
    console.error(`❌ Article ${articleId} unpublishing error:`, error)
    throw new Error(`Failed to unpublish article ${articleId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Publish all static articles in bulk
 */
export async function publishAllStaticArticles(): Promise<{ 
  success: boolean; 
  published: number; 
  failed: number; 
  results: Array<{ id: string; success: boolean; url?: string; error?: string }> 
}> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log(`📚 Publishing all ${staticArticles.length} static articles...`)
    
    // Ensure CSS files are cached first
    await ensureCSSFiles()
    
    const results = []
    let published = 0
    let failed = 0

    // Process articles in batches to avoid overwhelming R2
    const batchSize = 5
    for (let i = 0; i < staticArticles.length; i += batchSize) {
      const batch = staticArticles.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (article) => {
        try {
          const html = await renderStaticArticle(article.id)
          const key = article.slug // Use slug directly without 'articles/' prefix
          await uploadHtmlToPublic(key, html)
          const publicUrl = getPublicUrl(key)
          
          published++
          console.log(`✅ Published article ${article.id} (${published}/${staticArticles.length})`)
          
          return {
            id: article.id,
            success: true,
            url: publicUrl
          }
        } catch (error) {
          failed++
          console.error(`❌ Failed to publish article ${article.id}:`, error)
          
          return {
            id: article.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Small delay between batches
      if (i + batchSize < staticArticles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`🎉 Bulk publish completed: ${published} published, ${failed} failed`)
    
    return { 
      success: failed === 0, 
      published, 
      failed, 
      results 
    }

  } catch (error) {
    console.error('❌ Bulk publish error:', error)
    throw new Error(`Failed to publish articles: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Unpublish all static articles in bulk
 */
export async function unpublishAllStaticArticles(): Promise<{ 
  success: boolean; 
  unpublished: number; 
  failed: number; 
  results: Array<{ id: string; success: boolean; error?: string }> 
}> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log(`🗑️ Unpublishing all ${staticArticles.length} static articles...`)
    
    const results = []
    let unpublished = 0
    let failed = 0

    // Process articles in batches
    const batchSize = 10
    for (let i = 0; i < staticArticles.length; i += batchSize) {
      const batch = staticArticles.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (article) => {
        try {
          const key = article.slug // Use slug directly without 'articles/' prefix
          await deleteFromR2(key)
          
          unpublished++
          console.log(`✅ Unpublished article ${article.id} (${unpublished}/${staticArticles.length})`)
          
          return {
            id: article.id,
            success: true
          }
        } catch (error) {
          failed++
          console.error(`❌ Failed to unpublish article ${article.id}:`, error)
          
          return {
            id: article.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Small delay between batches
      if (i + batchSize < staticArticles.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log(`🎉 Bulk unpublish completed: ${unpublished} unpublished, ${failed} failed`)
    
    return { 
      success: failed === 0, 
      unpublished, 
      failed, 
      results 
    }

  } catch (error) {
    console.error('❌ Bulk unpublish error:', error)
    throw new Error(`Failed to unpublish articles: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check status of all static articles
 */
export async function checkStaticArticlesStatus(): Promise<{
  total: number;
  published: number;
  unpublished: number;
  articles: Array<{ id: string; title: string; published: boolean; url: string; slug: string }>
}> {
  // const author = await requireAuth()
  // requireAdmin(author.email) // Admin check

  try {
    console.log(`🔍 Checking status of ${staticArticles.length} static articles...`)
    
    // Import the file check function
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

    async function fileExistsInR2(key: string): Promise<boolean> {
      try {
        const command = new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        })
        
        await r2Client.send(command)
        return true
      } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          return false
        }
        throw error
      }
    }

    // Check all articles in batches
    const batchSize = 20
    const allResults = []
    
    for (let i = 0; i < staticArticles.length; i += batchSize) {
      const batch = staticArticles.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (article) => {
        const key = article.slug // Use slug directly without 'articles/' prefix
        const published = await fileExistsInR2(key)
        
        return {
          id: article.id,
          title: article.title,
          published,
          url: getPublicUrl(key),
          slug: article.slug
        }
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      const successfulResults = batchResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
      
      allResults.push(...successfulResults)
      
      // Small delay between batches
      if (i + batchSize < staticArticles.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    const published = allResults.filter(article => article.published).length
    const unpublished = allResults.length - published

    console.log(`✅ Status check completed: ${published} published, ${unpublished} unpublished`)
    
    return {
      total: staticArticles.length,
      published,
      unpublished,
      articles: allResults
    }

  } catch (error) {
    console.error('❌ Status check error:', error)
    throw new Error(`Failed to check articles status: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 
 
 
 
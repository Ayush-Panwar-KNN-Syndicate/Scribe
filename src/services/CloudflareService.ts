import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

/**
 * Cloudflare Service - Handles R2 storage operations, image processing, and CDN caching
 */
export class CloudflareService {
  private r2Client: S3Client

  constructor() {
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
  }

  /**
   * Check if a file exists in R2
   */
  async fileExists(key: string, bucket?: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket || process.env.R2_BUCKET_NAME!,
        Key: key,
      })

      await this.r2Client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Upload HTML content to R2 with aggressive caching
   */
  async uploadHtml(key: string, html: string, bucket?: string): Promise<void> {
    const targetBucket = bucket || process.env.R2_BUCKET_NAME!
    console.log(`📤 Uploading ${key} to R2 bucket ${targetBucket} with aggressive caching...`)

    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      Body: html,
      ContentType: 'text/html; charset=utf-8',
      CacheControl: 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400, immutable',
      ContentDisposition: 'inline',
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'content-type': 'article',
        'file-type': 'html-page',
        'cache-strategy': 'aggressive-7day',
        'performance-tier': 'high-traffic'
      },
      Expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ACL: 'public-read'
    })

    await this.r2Client.send(command)
    console.log(`✅ Successfully uploaded ${key} to ${targetBucket}`)
  }

  /**
   * Upload CSS file to R2 with ultra-aggressive caching
   */
  async uploadCSS(key: string, css: string, force = false, bucket?: string): Promise<boolean> {
    const targetBucket = bucket || process.env.R2_BUCKET_NAME!
    const contentHash = this.simpleHash(css)
    const hashKey = `${key}.hash`

    if (!force) {
      const [cssExists, hashExists] = await Promise.all([
        this.fileExists(key, targetBucket),
        this.fileExists(hashKey, targetBucket)
      ])

      if (cssExists && hashExists) {
        console.log(`📋 CSS ${key} already exists in ${targetBucket} - skipping`)
        return false
      }
    }

    console.log(`🎨 Uploading CSS ${key} to ${targetBucket}...`)

    const cssCommand = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      Body: css,
      ContentType: 'text/css; charset=utf-8',
      CacheControl: 'public, max-age=2592000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
      ContentDisposition: 'inline',
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'content-type': 'stylesheet',
        'content-hash': contentHash
      },
      Expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ACL: 'public-read'
    })

    const hashCommand = new PutObjectCommand({
      Bucket: targetBucket,
      Key: hashKey,
      Body: contentHash,
      ContentType: 'text/plain',
      CacheControl: 'public, max-age=86400',
      Metadata: {
        'css-file': key,
        'created-at': new Date().toISOString()
      }
    })

    await Promise.all([
      this.r2Client.send(cssCommand),
      this.r2Client.send(hashCommand)
    ])

    console.log(`✅ CSS ${key} uploaded to ${targetBucket}`)
    return true
  }

  /**
   * Delete file from R2
   */
  async delete(key: string, bucket?: string, publicUrl?: string): Promise<void> {
    const targetBucket = bucket || process.env.R2_BUCKET_NAME!
    console.log(`🗑️ Deleting ${key} from R2 bucket ${targetBucket}...`)

    const command = new DeleteObjectCommand({
      Bucket: targetBucket,
      Key: key,
    })

    await this.r2Client.send(command)
    console.log(`✅ Deleted ${key} from ${targetBucket}`)

    try {
      const url = publicUrl || this.getPublicUrl(key)
      await this.purgeCache(url)
    } catch (error) {
      console.warn(`⚠️ Cache purge failed: ${error}`)
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string, publicUrlBase?: string): string {
    const baseUrl = publicUrlBase || process.env.R2_PUBLIC_URL!
    return `${baseUrl}/${key}`
  }

  /**
   * Purge Cloudflare CDN cache
   */
  async purgeCache(urls: string | string[]): Promise<void> {
    const urlArray = Array.isArray(urls) ? urls : [urls]
    
    console.log(`🔄 Purging cache:`, urlArray)
    
    if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: urlArray })
        }
      )
      
      if (!response.ok) {
        throw new Error(`Cache purge failed: ${response.status}`)
      }
      
      console.log(`✅ Cache purged`)
    } else {
      console.log(`ℹ️ Cache purge simulated`)
    }
  }

  /**
   * Ensure CSS files are uploaded
   */
  async ensureCSSFiles(bucket?: string): Promise<void> {
    const CRITICAL_CSS = `
/* Critical CSS */
.article-header{margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid #eee}
.article-meta{display:flex;align-items:center;gap:15px;font-size:14px;color:#666;margin-bottom:15px;flex-wrap:wrap}
.category-badge{background:#3b82f6;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500}
.article-excerpt{font-size:1.1rem;color:#555;line-height:1.7}
.article-content{contain:layout style}
`

    const MAIN_CSS = `
/* Main CSS */
@media(min-width:769px){.container{display:grid;grid-template-columns:1fr 300px;gap:30px}}
.article-section{margin:40px 0}
.section-header{font-size:1.8rem;font-weight:600;margin-bottom:20px;color:#1a1a1a;border-left:4px solid #3b82f6;padding-left:15px}
.section-content{font-size:1.05rem;line-height:1.7;color:#444}
.section-content p{margin-bottom:20px}
.ad-slot{margin:30px auto;text-align:center;min-height:250px;background:#f8f9fa}
@media(max-width:768px){.section-header{font-size:1.5rem}}
`

    await Promise.all([
      this.uploadCSS('styles/critical.css', CRITICAL_CSS, false, bucket),
      this.uploadCSS('styles/main.css', MAIN_CSS, false, bucket)
    ])
  }

  /**
   * Simple hash function
   */
  private simpleHash(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }
}

// Singleton instance
export const cloudflareService = new CloudflareService()

// Domain config type
export interface DomainConfig {
  r2Bucket: string
  r2PublicUrl: string
}

// Backward compatibility exports (use default env vars)
export const uploadHtmlToPublic = (key: string, html: string, bucket?: string) =>
  cloudflareService.uploadHtml(key, html, bucket)
export const deleteFromR2 = (key: string, bucket?: string, publicUrl?: string) =>
  cloudflareService.delete(key, bucket, publicUrl)
export const getPublicUrl = (key: string, publicUrlBase?: string) =>
  cloudflareService.getPublicUrl(key, publicUrlBase)
export const purgeCache = (urls: string | string[]) =>
  cloudflareService.purgeCache(urls)
export const ensureCSSFiles = (bucket?: string) =>
  cloudflareService.ensureCSSFiles(bucket)

// Domain-aware helper functions
export const uploadHtmlToDomain = (key: string, html: string, domainConfig: DomainConfig) =>
  cloudflareService.uploadHtml(key, html, domainConfig.r2Bucket)

export const deleteFromDomain = (key: string, domainConfig: DomainConfig) =>
  cloudflareService.delete(key, domainConfig.r2Bucket, cloudflareService.getPublicUrl(key, domainConfig.r2PublicUrl))

export const getPublicUrlForDomain = (key: string, domainConfig: DomainConfig) =>
  cloudflareService.getPublicUrl(key, domainConfig.r2PublicUrl)

export const ensureCSSFilesForDomain = (domainConfig: DomainConfig) =>
  cloudflareService.ensureCSSFiles(domainConfig.r2Bucket)


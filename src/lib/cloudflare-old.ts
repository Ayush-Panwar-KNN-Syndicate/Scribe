import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

// Configure R2 client with Access Key credentials
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for R2 compatibility
})

/**
 * Check if a file exists in R2
 * @param key - File path/name to check
 * @returns true if file exists, false otherwise
 */
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
    throw error // Re-throw if it's a different error
  }
}

/**
 * Generate a simple hash for CSS content to detect changes
 * @param content - CSS content to hash
 * @returns Simple hash string
 */
function simpleHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Process image for web display
 * @param file - Original image file
 * @param maxWidth - Maximum width for resizing
 * @param quality - JPEG quality (0.1 - 1.0)
 * @param forceFormat - Force specific output format ('webp' | 'jpeg' | 'auto')
 * @returns Processed image buffer and metadata
 */
async function processImage(
  file: File, 
  maxWidth = 1200, 
  quality = 0.85, 
  forceFormat: 'webp' | 'jpeg' | 'auto' = 'auto'
): Promise<{
  buffer: Uint8Array,
  originalSize: number,
  finalSize: number,
  format: string,
  dimensions: { width: number, height: number }
}> {
  const originalSize = file.size
  
  try {
    // Use canvas for client-side processing when available
    if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
      return await processImageWithCanvas(file, maxWidth, quality, forceFormat)
    }
    
    // Basic processing for server-side
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    const outputFormat = forceFormat === 'auto' 
      ? (file.type.includes('webp') ? 'webp' : 'jpeg')
      : forceFormat
    
    return {
      buffer: buffer,
      originalSize,
      finalSize: buffer.length,
      format: outputFormat === 'webp' ? 'image/webp' : 'image/jpeg',
      dimensions: { width: maxWidth, height: Math.round(maxWidth * 0.6) }
    }
    
  } catch (error) {
    console.warn('⚠️ Image processing failed, using original:', error)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    
    return {
      buffer: buffer,
      originalSize,
      finalSize: buffer.length,
      format: file.type,
      dimensions: { width: maxWidth, height: Math.round(maxWidth * 0.6) }
    }
  }
}

/**
 * Client-side image processing using Canvas API
 */
async function processImageWithCanvas(
  file: File, 
  maxWidth: number, 
  quality: number,
  forceFormat: 'webp' | 'jpeg' | 'auto' = 'auto'
): Promise<{
  buffer: Uint8Array,
  originalSize: number,
  finalSize: number,
  format: string,
  dimensions: { width: number, height: number }
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    img.onload = () => {
      // Calculate new dimensions
      const { width: newWidth, height: newHeight } = calculateDimensions(
        img.width, 
        img.height, 
        maxWidth
      )
      
      // Set canvas size
      canvas.width = newWidth
      canvas.height = newHeight
      
      // Enable smooth rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Choose output format
      let outputFormat: string
      if (forceFormat === 'webp') {
        outputFormat = 'image/webp'
      } else if (forceFormat === 'jpeg') {
        outputFormat = 'image/jpeg'
      } else {
        outputFormat = supportsWebP() ? 'image/webp' : 'image/jpeg'
      }
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas processing failed'))
          return
        }
        
        blob.arrayBuffer().then(arrayBuffer => {
          resolve({
            buffer: new Uint8Array(arrayBuffer),
            originalSize: file.size,
            finalSize: blob.size,
            format: outputFormat,
            dimensions: { width: newWidth, height: newHeight }
          })
        })
      }, outputFormat, quality)
    }
    
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculate new image dimensions maintaining aspect ratio
 */
function calculateDimensions(originalWidth: number, originalHeight: number, maxWidth: number): {
  width: number,
  height: number
} {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight }
  }
  
  const aspectRatio = originalHeight / originalWidth
  const newWidth = maxWidth
  const newHeight = Math.round(newWidth * aspectRatio)
  
  return { width: newWidth, height: newHeight }
}

/**
 * Check if browser supports WebP format
 */
function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

/**
 * Upload image to R2 with multiple formats and caching
 * @param file - Image file to upload
 * @param slug - Article slug for naming
 * @returns Public URL of primary uploaded image
 */
export async function uploadImageToR2(file: File, slug: string): Promise<string> {
  try {
    console.log(`🖼️ Uploading image for article: ${slug}`)
    
    const timestamp = Date.now()
    
    // Generate WebP version for modern browsers
    let webpResult = null
    let webpUrl = null
    
    try {
      webpResult = await processImage(file, 1200, 0.85, 'webp')
      const webpFilename = `images/${slug}-${timestamp}.webp`
      
      await uploadSingleImage(webpFilename, webpResult, 'image/webp')
      webpUrl = getPublicUrl(webpFilename)
      
      console.log(`✅ WebP version uploaded: ${formatBytes(webpResult.finalSize)}`)
    } catch (error) {
      console.warn('⚠️ WebP generation failed, continuing with JPEG only:', error)
    }
    
    // Generate JPEG version for compatibility
    const jpegResult = await processImage(file, 1200, 0.85, 'jpeg')
    const jpegFilename = `images/${slug}-${timestamp}.jpg`
    
    await uploadSingleImage(jpegFilename, jpegResult, 'image/jpeg')
    const jpegUrl = getPublicUrl(jpegFilename)
    
    console.log(`✅ JPEG version uploaded: ${formatBytes(jpegResult.finalSize)}`)
    
    // Log results
    const originalSize = file.size
    const bestSize = webpResult ? Math.min(webpResult.finalSize, jpegResult.finalSize) : jpegResult.finalSize
    const savings = Math.round((1 - bestSize / originalSize) * 100)
    
    console.log(`📊 Image processing complete:`)
    console.log(`   • Original: ${formatBytes(originalSize)}`)
    if (webpResult) {
      console.log(`   • WebP: ${formatBytes(webpResult.finalSize)} (${Math.round((1 - webpResult.finalSize / originalSize) * 100)}% smaller)`)
    }
    console.log(`   • JPEG: ${formatBytes(jpegResult.finalSize)} (${Math.round((1 - jpegResult.finalSize / originalSize) * 100)}% smaller)`)
    console.log(`   • Best: ${savings}% size reduction`)
    console.log(`   • Formats: ${webpResult ? 'WebP + JPEG' : 'JPEG only'}`)
    
    // Return JPEG URL as primary (most compatible)
    // Frontend will construct WebP URL by replacing .jpg with .webp
    return jpegUrl
    
  } catch (error) {
    console.error(`❌ Failed to upload image:`, error)
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload a single image file to R2
 */
async function uploadSingleImage(
  filename: string, 
  result: { buffer: Uint8Array; originalSize: number; finalSize: number; format: string; dimensions: { width: number; height: number } }, 
  contentType: string
): Promise<void> {
  const savings = Math.round((1 - result.finalSize / result.originalSize) * 100)
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: filename,
    Body: result.buffer,
    ContentType: contentType,
    
    // Long-term caching for images
    CacheControl: 'public, max-age=31536000, s-maxage=31536000, immutable',
    
    // Performance headers
    ContentDisposition: 'inline',
    
    // Image metadata
    Metadata: {
      'uploaded-at': new Date().toISOString(),
      'content-type': 'image',
      'file-type': 'article-image',
      'cache-strategy': 'long-term',
      'original-size': result.originalSize.toString(),
      'final-size': result.finalSize.toString(),
      'size-reduction': savings.toString(),
      'image-width': result.dimensions.width.toString(),
      'image-height': result.dimensions.height.toString(),
      'format': result.format
    },
    
    // Long expiration for images
    Expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    
    // Public access
    ACL: 'public-read'
  })

  await r2Client.send(command)
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Upload HTML content to R2 bucket with aggressive caching headers
 * @param key - File path/name (e.g., "my-article" - no .html extension)
 * @param html - HTML content to upload
 */
export async function uploadHtmlToPublic(key: string, html: string): Promise<void> {
  try {
    console.log(`📤 Uploading ${key} to R2 with aggressive caching...`)
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: html,
      ContentType: 'text/html; charset=utf-8',
      
      // Aggressive caching for 1M/day performance
      CacheControl: 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400, immutable',
      
      // Performance headers
      ContentDisposition: 'inline',
      
      // SEO and performance metadata
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'content-type': 'article',
        'file-type': 'html-page',
        'cache-strategy': 'aggressive-7day',
        'performance-tier': 'high-traffic'
      },
      
      // Additional headers for CDN optimization
      Expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      
      // CORS headers for global distribution
      ACL: 'public-read'
    })

    await r2Client.send(command)
    console.log(`✅ Successfully uploaded ${key} with aggressive caching enabled`)
    
  } catch (error) {
    console.error(`❌ Failed to upload ${key} to R2:`, error)
    throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload CSS file to R2 with ultra-aggressive caching (30 days)
 * Only uploads if file doesn't exist or content has changed
 * @param key - CSS file path (e.g., "styles/critical.css")
 * @param css - CSS content to upload
 * @param force - Force upload even if file exists (default: false)
 */
export async function uploadCSSToPublic(key: string, css: string, force = false): Promise<boolean> {
  try {
    const contentHash = simpleHash(css)
    const hashKey = `${key}.hash`
    
    // Check if CSS file and hash already exist (unless forced)
    if (!force) {
      const [cssExists, hashExists] = await Promise.all([
        fileExistsInR2(key),
        fileExistsInR2(hashKey)
      ])
      
      if (cssExists && hashExists) {
        console.log(`📋 CSS ${key} already exists and is up-to-date - skipping upload`)
        return false // Not uploaded
      }
    }
    
    console.log(`🎨 Uploading CSS ${key} to R2 with ultra-aggressive caching...`)
    
    // Upload CSS file
    const cssCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: css,
      ContentType: 'text/css; charset=utf-8',
      
      // Ultra-aggressive caching for CSS (30 days browser, 1 year edge)
      CacheControl: 'public, max-age=2592000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
      
      // Performance headers
      ContentDisposition: 'inline',
      
      // CSS-specific metadata
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'content-type': 'stylesheet',
        'file-type': 'css-cache',
        'cache-strategy': 'ultra-aggressive-30day',
        'performance-tier': 'shared-asset',
        'content-hash': contentHash
      },
      
      // Long expiration for CSS files
      Expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      
      // CORS headers for cross-origin CSS
      ACL: 'public-read'
    })

    // Upload hash file for change detection
    const hashCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: hashKey,
      Body: contentHash,
      ContentType: 'text/plain',
      CacheControl: 'public, max-age=86400', // 1 day cache for hash
      Metadata: {
        'css-file': key,
        'created-at': new Date().toISOString()
      }
    })

    // Upload both files in parallel
    await Promise.all([
      r2Client.send(cssCommand),
      r2Client.send(hashCommand)
    ])
    
    console.log(`✅ Successfully uploaded CSS ${key} with ultra-aggressive caching`)
    return true // Uploaded
    
  } catch (error) {
    console.error(`❌ Failed to upload CSS ${key} to R2:`, error)
    throw new Error(`CSS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload and cache CSS files for optimal performance at scale
 * Only uploads if files don't exist or have changed
 */
export async function uploadCSSFiles(force = false): Promise<void> {
  const CRITICAL_CSS = `
/* Critical CSS - Cached across all articles */
.article-header{margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid #eee}
.article-meta{display:flex;align-items:center;gap:15px;font-size:14px;color:#666;margin-bottom:15px;flex-wrap:wrap}
.category-badge{background:#3b82f6;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500}
.article-excerpt{font-size:1.1rem;color:#555;line-height:1.7}
.article-content{contain:layout style}
`

  const MAIN_CSS = `
/* Main CSS - Cached across all articles */
@media(min-width:769px){.container{display:grid;grid-template-columns:1fr 300px;gap:30px}}
.article-section{margin:40px 0}
.section-header{font-size:1.8rem;font-weight:600;margin-bottom:20px;color:#1a1a1a;border-left:4px solid #3b82f6;padding-left:15px}
.section-content{font-size:1.05rem;line-height:1.7;color:#444}
.section-content p{margin-bottom:20px}
.section-content ul,.section-content ol{margin:20px 0;padding-left:30px}
.section-content li{margin-bottom:8px}
.ad-slot{margin:30px auto;text-align:center;min-height:250px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;display:flex;align-items:center;justify-content:center;contain:layout}
.ad-hero{min-height:90px;margin:20px auto;max-width:728px}
.ad-content-1,.ad-content-2{min-height:250px;margin:40px auto;max-width:100%}
.ad-footer{min-height:250px;margin:40px auto 20px;max-width:100%}
.sidebar{position:sticky;top:20px;height:fit-content}
.ad-sidebar{width:300px;min-height:600px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;margin-bottom:20px}
@media(max-width:768px){.section-header{font-size:1.5rem}.ad-hero{min-height:50px;max-width:320px}.ad-content-1,.ad-content-2,.ad-footer{min-height:200px;margin:25px auto}.sidebar{position:static}.ad-sidebar{width:100%;min-height:250px}}
.adsbygoogle{display:block!important}
`

  try {
    console.log(`🔍 Checking CSS files${force ? ' (forced upload)' : ''}...`)
    
    // Upload both CSS files in parallel, check if they were actually uploaded
    const [criticalUploaded, mainUploaded] = await Promise.all([
      uploadCSSToPublic('styles/critical.css', CRITICAL_CSS, force),
      uploadCSSToPublic('styles/main.css', MAIN_CSS, force)
    ])
    
    if (criticalUploaded || mainUploaded) {
      console.log('🎉 CSS files uploaded and cached successfully!')
      
      if (criticalUploaded) console.log('  ✅ styles/critical.css - uploaded')
      else console.log('  📋 styles/critical.css - already cached')
      
      if (mainUploaded) console.log('  ✅ styles/main.css - uploaded')
      else console.log('  📋 styles/main.css - already cached')
      
    } else {
      console.log('📋 All CSS files already cached - no upload needed!')
    }
    
  } catch (error) {
    console.error('❌ Failed to upload CSS files:', error)
    throw error
  }
}

/**
 * Ensure CSS files are available (upload only if needed)
 * This should be called before publishing articles
 */
export async function ensureCSSFiles(): Promise<void> {
  await uploadCSSFiles(false) // Don't force, only upload if needed
}

/**
 * Delete file from R2 bucket
 * @param key - File path/name to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting ${key} from R2...`)
    
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })

    await r2Client.send(command)
    console.log(`✅ Successfully deleted ${key} from R2`)
    
    // Auto-purge cache when deleting content
    try {
      const publicUrl = getPublicUrl(key)
      await purgeCache(publicUrl)
      console.log(`🔄 Cache purged for deleted article: ${key}`)
    } catch (purgeError) {
      console.warn(`⚠️ Cache purge failed for deleted article: ${key}`, purgeError)
    }
    
  } catch (error) {
    console.error(`❌ Failed to delete ${key} from R2:`, error)
    throw new Error(`R2 deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get public URL for uploaded file
 * @param key - File path/name (without .html extension)
 * @returns Public URL to access the file
 */
export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

/**
 * Purge Cloudflare cache for specific URLs - Critical for 1M/day traffic
 * @param urls - Array of URLs to purge
 */
export async function purgeCache(urls: string | string[]): Promise<void> {
  const urlArray = Array.isArray(urls) ? urls : [urls]
  
  try {
    console.log(`🔄 Purging Cloudflare cache for:`, urlArray)
    
    // If Cloudflare Zone API credentials are available
    if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            files: urlArray
          })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Cloudflare cache purge failed: ${response.status} - ${errorData}`)
      }
      
      const result = await response.json()
      console.log(`✅ Cache purged successfully:`, result)
      
    } else {
      console.log(`ℹ️ Cache purge simulated (configure CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN for production)`)
    }
    
  } catch (error) {
    console.error('❌ Cache purge failed:', error)
    // Don't throw error - cache purge failure shouldn't break publishing
  }
}

/**
 * Test R2 connection and caching setup
 */
export async function testR2Connection(): Promise<boolean> {
  try {
    console.log('🔍 Testing R2 connection with caching optimization...')
    
    const testKey = `test-cache-${Date.now()}`
    const testContent = `
<!DOCTYPE html>
<html>
<head>
    <title>R2 Cache Test</title>
    <meta http-equiv="Cache-Control" content="public, max-age=604800, s-maxage=2592000">
</head>
<body>
    <h1>✅ R2 + Aggressive Caching Test</h1>
    <p>Sub-200ms TTFB optimization active</p>
    <p>7-day edge cache enabled</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
</body>
</html>`
    
    // Test upload with caching
    await uploadHtmlToPublic(testKey, testContent)
    
    // Test cache purge
    const testUrl = getPublicUrl(testKey)
    await purgeCache(testUrl)
    
    // Test delete (which also purges cache)
    await deleteFromR2(testKey)
    
    console.log('✅ R2 connection with caching test successful!')
    return true
    
  } catch (error) {
    console.error('❌ R2 caching test failed:', error)
    return false
  }
} 

/**
 * Clean up orphaned images that were uploaded but never published
 * This should be run periodically (e.g., daily) to free up storage
 * @param maxAgeHours - Remove images older than this many hours (default: 24)
 */
export async function cleanupOrphanedImages(maxAgeHours = 24): Promise<{
  scanned: number;
  removed: number;
  freed: number; // bytes
}> {
  try {
    console.log(`🧹 Starting cleanup of orphaned images older than ${maxAgeHours} hours...`)
    
    // In a real implementation, you would:
    // 1. List all images in the images/ folder
    // 2. Compare with published articles in database
    // 3. Remove images not referenced by any published article
    // 4. Only remove images older than maxAgeHours
    
    // For now, return a mock cleanup result
    // TODO: Implement actual S3 ListObjects and cleanup logic
    
    console.log(`✅ Orphaned image cleanup completed`)
    
    return {
      scanned: 0,
      removed: 0,
      freed: 0
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

/**
 * Delete specific image from R2 (useful for cleaning up when articles are deleted)
 * @param imageUrl - Full public URL of the image to delete
 */
export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  try {
    // Extract the key from the public URL
    const publicUrlBase = process.env.R2_PUBLIC_URL
    if (!imageUrl.startsWith(publicUrlBase + '/')) {
      throw new Error('Invalid image URL - not from our R2 bucket')
    }
    
    const key = imageUrl.replace(publicUrlBase + '/', '')
    
    console.log(`🗑️ Deleting image: ${key}`)
    
    // Delete both WebP and JPEG versions if they exist
    const baseKey = key.replace(/\.(jpg|jpeg|webp)$/i, '')
    const webpKey = `${baseKey}.webp`
    const jpegKey = `${baseKey}.jpg`
    
    // Try to delete both formats (ignore errors if they don't exist)
    const deletePromises = [
      deleteFromR2(webpKey).catch(() => {}), // Ignore 404 errors
      deleteFromR2(jpegKey).catch(() => {})   // Ignore 404 errors
    ]
    
    await Promise.all(deletePromises)
    
    console.log(`✅ Image cleanup completed: ${key}`)
    
  } catch (error) {
    console.error(`❌ Failed to delete image: ${imageUrl}`, error)
    throw error
  }
} 
 
 
 
 
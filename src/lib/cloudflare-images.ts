/**
 * Cloudflare Images API client
 * Much simpler and more optimal than manual R2 processing
 */

interface CloudflareImageResponse {
  success: boolean
  result: {
    id: string
    filename: string
    uploaded: string
    requireSignedURLs: boolean
    variants: string[]
  }
  errors: any[]
  messages: any[]
}

/**
 * Upload image to Cloudflare Images
 * Automatically optimizes, creates variants, and serves via global CDN
 * @param file - Image file to upload
 * @param slug - Article slug for naming
 * @returns Image ID and URLs
 */
export async function uploadImageToCloudflare(file: File, slug?: string): Promise<{
  id: string
  url: string
  variants: {
    thumbnail: string
    small: string
    medium: string
    large: string
    original: string
  }
}> {
  try {
    console.log(`🖼️ Uploading to Cloudflare Images: ${file.name}`)
    
    // Prepare form data
    const formData = new FormData()
    formData.append('file', file)
    // Attach optional metadata if slug provided
    const metadata: Record<string, string> = { uploaded: new Date().toISOString() }
    if (slug) {
      metadata.article = slug
    }
    formData.append('metadata', JSON.stringify(metadata))
    
    // Upload to Cloudflare Images API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Cloudflare Images upload failed: ${response.status} - ${errorText}`)
    }

    const result: CloudflareImageResponse = await response.json()
    
    if (!result.success) {
      throw new Error(`Upload failed: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const imageId = result.result.id
    const baseUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_HASH}`
    
    // Generate variant URLs
    const variants = {
      thumbnail: `${baseUrl}/${imageId}/thumbnail`,  // 100x100
      small: `${baseUrl}/${imageId}/small`,          // 400x400  
      medium: `${baseUrl}/${imageId}/medium`,        // 800x800
      large: `${baseUrl}/${imageId}/large`,          // 1200x1200
      original: `${baseUrl}/${imageId}/public`       // Original size
    }

    console.log(`✅ Uploaded to Cloudflare Images: ${imageId}`)
    console.log(`📊 Original: ${formatBytes(file.size)}`)
    console.log(`🌐 Variants: thumbnail, small, medium, large, original`)
    
    return {
      id: imageId,
      url: variants.large, // Use large as primary
      variants
    }

  } catch (error) {
    console.error(`❌ Cloudflare Images upload failed:`, error)
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete image from Cloudflare Images
 * @param imageId - Cloudflare Images ID
 */
export async function deleteImageFromCloudflare(imageId: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting image: ${imageId}`)
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Delete failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(`Delete failed: ${result.errors?.map((e: any) => e.message).join(', ')}`)
    }

    console.log(`✅ Image deleted: ${imageId}`)

  } catch (error) {
    console.error(`❌ Failed to delete image:`, error)
    throw error
  }
}

/**
 * Get optimal image variant for specific context
 * @param imageId - Cloudflare Images ID
 * @param context - Where the image will be used
 * @returns Optimized image URL
 */
export function getOptimalImageUrl(
  imageId: string, 
  context: 'thumbnail' | 'card' | 'article' | 'hero' | 'social'
): string {
  const hash = process.env.CLOUDFLARE_IMAGES_HASH
  
  switch (context) {
    case 'thumbnail':
      return `https://imagedelivery.net/${hash}/${imageId}/thumbnail` // 100x100, ~15KB
    case 'card':
      return `https://imagedelivery.net/${hash}/${imageId}/small` // 400x400, ~80KB
    case 'article':
      return `https://imagedelivery.net/${hash}/${imageId}/medium` // 800x800, ~200KB
    case 'hero':
      return `https://imagedelivery.net/${hash}/${imageId}/large` // 1200x1200, ~350KB
    case 'social':
      return `https://imagedelivery.net/${hash}/${imageId}/public` // Original, for OG tags
    default:
      return `https://imagedelivery.net/${hash}/${imageId}/medium`
  }
}

/**
 * Get image URL with specific variant
 * @param imageId - Cloudflare Images ID
 * @param variant - Image variant (thumbnail, small, medium, large, public)
 * @returns Optimized image URL
 */
export function getImageUrl(imageId: string, variant: 'thumbnail' | 'small' | 'medium' | 'large' | 'public' = 'large'): string {
  return `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_HASH}/${imageId}/${variant}`
}

/**
 * Generate responsive image HTML with correct Cloudflare Images variants
 * @param imageId - Cloudflare Images ID
 * @param alt - Alt text
 * @returns Responsive picture element
 */
export function generateResponsiveImage(imageId: string, alt: string = 'Article image'): string {
  const hash = process.env.CLOUDFLARE_IMAGES_HASH
  
  return `
    <picture class="article-picture">
      <!-- Mobile: Use small variant to save bandwidth -->
      <source media="(max-width: 480px)" 
              srcset="https://imagedelivery.net/${hash}/${imageId}/small">
      
      <!-- Tablet: Use medium variant for balance -->
      <source media="(max-width: 768px)" 
              srcset="https://imagedelivery.net/${hash}/${imageId}/medium">
      
      <!-- Desktop: Use large variant for quality -->
      <source media="(min-width: 769px)" 
              srcset="https://imagedelivery.net/${hash}/${imageId}/large">
      
      <!-- Fallback: Use medium as safe default (NO srcset to prevent double download) -->
      <img src="https://imagedelivery.net/${hash}/${imageId}/medium" 
           alt="${escapeHtml(alt)}"
           class="article-image"
           loading="lazy"
           decoding="async">
    </picture>
  `
}

/**
 * Generate responsive image HTML with debug info (for testing)
 * @param imageId - Cloudflare Images ID
 * @param alt - Alt text
 * @returns Responsive picture element with debug indicators
 */
export function generateResponsiveImageDebug(imageId: string, alt: string = 'Article image'): string {
  const hash = process.env.CLOUDFLARE_IMAGES_HASH
  
  return `
    <picture class="article-picture">
      <!-- Mobile: Use small variant -->
      <source media="(max-width: 480px)" 
              srcset="https://imagedelivery.net/${hash}/${imageId}/small"
              data-variant="small">
      
      <!-- Tablet: Use medium variant -->
      <source media="(max-width: 768px)" 
              srcset="https://imagedelivery.net/${hash}/${imageId}/medium"
              data-variant="medium">
      
      <!-- Desktop: Use large variant -->
      <source media="(min-width: 769px)" 
              srcset="https://imagedelivery.net/${hash}/${imageId}/large"
              data-variant="large">
      
      <!-- Fallback -->
      <img src="https://imagedelivery.net/${hash}/${imageId}/medium" 
           alt="${escapeHtml(alt)}"
           class="article-image"
           loading="lazy"
           decoding="async"
           data-fallback="medium"
           onload="console.log('Image loaded:', this.currentSrc || this.src)">
    </picture>
    
    <!-- Debug info -->
    <div style="font-size:10px;color:#666;text-align:center;margin-top:4px;">
      📱 Mobile: small | 💻 Tablet: medium | 🖥️ Desktop: large
    </div>
  `
}

/**
 * Format bytes helper
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Escape HTML helper
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
} 
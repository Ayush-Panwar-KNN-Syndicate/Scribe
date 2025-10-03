/**
 * @deprecated Use @/services/CloudflareService instead
 * This file is kept for backward compatibility
 */
export { 
  cloudflareService,
  CloudflareService,
  uploadHtmlToPublic,
  deleteFromR2,
  getPublicUrl,
  purgeCache,
  ensureCSSFiles
} from '@/services/CloudflareService'

// Note: Image upload functions remain in cloudflare-images.ts
// The old cloudflare.ts is too large and will be phased out


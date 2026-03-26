/**
 * Site Configuration
 *
 * This file centralizes all site-specific configuration.
 * Different domains use different environment variables.
 *
 * Usage:
 * - topreserchtopics.com uses .env.topreserchtopics
 * - thefactrelay.com uses .env.thefactrelay
 */

export const siteConfig = {
  // Site Identity
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Top Research Topics',
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'topreserchtopics.com',
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'hello@topreserchtopics.com',
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Explore In-Depth Research Topics',

  // URLs
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://topreserchtopics.com',
  searchUrl: process.env.NEXT_PUBLIC_SEARCH_URL || 'https://search.topreserchtopics.com',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.topreserchtopics.com',
  r2Url: process.env.R2_PUBLIC_URL || 'https://pub-47192a9712a3462ba44953b639a4d2e8.r2.dev',

  // Branding
  logo: process.env.NEXT_PUBLIC_SITE_LOGO || '/logos/topreserchtopics.svg',
  favicon: process.env.NEXT_PUBLIC_SITE_FAVICON || '/favicons/topreserchtopics/favicon.ico',

  // Analytics
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
  taboolaId: process.env.NEXT_PUBLIC_TABOOLA_ID,

  // Social
  twitter: process.env.NEXT_PUBLIC_TWITTER,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK,

  // SEO
  defaultMetadata: {
    title: process.env.NEXT_PUBLIC_SITE_NAME || 'Top Research Topics',
    description: process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Explore In-Depth Research Topics',
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '/og-images/topreserchtopics.com.png',
  },

  // Features
  features: {
    search: process.env.NEXT_PUBLIC_FEATURE_SEARCH !== 'false',
    comments: process.env.NEXT_PUBLIC_FEATURE_COMMENTS !== 'false',
    newsletter: process.env.NEXT_PUBLIC_FEATURE_NEWSLETTER !== 'false',
  },
} as const

export type SiteConfig = typeof siteConfig

// Helper function to get full URL
export function getFullUrl(path: string = ''): string {
  return `${siteConfig.url}${path}`
}

// Helper function to get R2 URL
export function getR2Url(path: string = ''): string {
  return `${siteConfig.r2Url}${path}`
}

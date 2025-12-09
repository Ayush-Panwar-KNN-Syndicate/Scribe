/**
 * Validates the origin of incoming requests against a whitelist
 * Supports wildcard patterns for flexible subdomain matching
 */
export function validateOrigin(origin: string | null, allowedOrigins: string): boolean {
  if (!origin) {
    // Reject requests with no origin for security
    // Only allow specific cases like direct server requests if needed
    return false
  }
  
  const allowed = allowedOrigins.split(',').map(o => o.trim())
  
  // Exact match check
  if (allowed.includes(origin)) {
    return true
  }
  
  // Pattern matching for dynamic subdomains (e.g., *.yourdomain.com)
  return allowed.some(pattern => {
    if (pattern.includes('*')) {
      // Convert wildcard pattern to regex
      // Example: "*.yourdomain.com" becomes "^.*\.yourdomain\.com$"
      const regexPattern = pattern
        .replace(/\./g, '\\.')  // Escape dots
        .replace(/\*/g, '.*')   // Replace * with .*
      
      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(origin)
    }
    return false
  })
}

/**
 * Validates if the user agent appears to be from a legitimate browser
 * This is a basic check and can be easily bypassed, but helps filter basic bots
 */
export function validateUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false
  
  // Basic user agent validation - should contain common browser identifiers
  const legitimateBrowsers = [
    'Mozilla',
    'Chrome',
    'Safari',
    'Firefox',
    'Edge',
    'Opera'
  ]
  
  return legitimateBrowsers.some(browser => 
    userAgent.includes(browser)
  )
}

/**
 * Extracts real IP address from various header sources
 * Cloudflare provides cf-connecting-ip which is the most reliable
 */
export function extractClientIP(request: Request): string {
  return request.headers.get('cf-connecting-ip') || 
         request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') ||
         request.headers.get('x-client-ip') ||
         'unknown'
}

/**
 * Basic request size validation
 */
export function validateRequestSize(contentLength: string | null, maxSize: number = 10240): boolean {
  if (!contentLength) return true // Allow requests without content-length
  
  const size = parseInt(contentLength, 10)
  return !isNaN(size) && size <= maxSize
} 
 
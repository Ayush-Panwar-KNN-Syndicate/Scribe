import { ArticleForRender, ArticleSection } from '@/types/database'
import { generateResponsiveImage } from './cloudflare-images'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function sectionsToHtml(sections: ArticleSection[], imageId?: string | null): string {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)
  
  let html = ''
  
  sortedSections.forEach((section, index) => {
    const headerHtml = escapeHtml(section.header)
    const contentHtml = section.content // Content is already HTML from editor
    
    html += `
      <section class="content-section">
        <h2 class="section-title">${headerHtml}</h2>
        <div class="section-body">
          ${contentHtml}
        </div>
      </section>
    `
    
    // Insert article image after section 1 (index 0)
    if (index === 0 && imageId) {
      html += `
        <!-- Article Image (Cloudflare Images) -->
        <figure class="article-image-container">
          ${generateResponsiveImage(imageId, 'Article illustration')}
        </figure>
      `
    }
    
    // Insert ads after 2nd and 4th sections
    if (index === 1) {
      html += `
        <!-- Maximum Keyword Block Coverage - Inline Ad #1 -->
        <div class="ad-container ad-inline" id="ad-content-1">
          <ins class="adsbygoogle"
               style="display:block;width:100%;height:60vh;"
               data-ad-client="ca-pub-XXXXXXXXX"
               data-ad-slot="XXXXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      `
    }
    
    if (index === 3) {
      html += `
        <!-- Maximum Keyword Block Coverage - Inline Ad #2 -->
        <div class="ad-container ad-inline" id="ad-content-2">
          <ins class="adsbygoogle"
               style="display:block;width:100%;height:60vh;"
               data-ad-client="ca-pub-XXXXXXXXX"
               data-ad-slot="XXXXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      `
    }
  })
  
  return html
}

function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function toISOString(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toISOString()
}

export async function renderStructuredArticleHtml(article: ArticleForRender): Promise<string> {
  const sectionsHtml = sectionsToHtml(article.sections, article.image_id)
  const publishedDate = formatDate(article.published_at)
  const publishedISO = toISOString(article.published_at)
  const categoryName = article.category?.name || 'Uncategorized'
  
  // Generate image meta URL for social sharing
  const imageMetaUrl = article.image_id
    ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_HASH}/${article.image_id}/large`
    : null

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <meta name="theme-color" content="#0a0a0a">
    
    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//pagead2.googlesyndication.com">
    <link rel="dns-prefetch" href="//imagedelivery.net">
    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://pagead2.googlesyndication.com">
    <link rel="preconnect" href="https://imagedelivery.net">
    
    <!-- AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXX" crossorigin="anonymous"></script>
    
    <!-- Fonts -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>
    
    <!-- SEO Meta -->
    <title>${escapeHtml(article.title)}</title>
    <meta name="description" content="${escapeHtml(article.excerpt || '')}">
    <meta name="robots" content="index, follow">
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(article.title)}">
    <meta property="og:description" content="${escapeHtml(article.excerpt || '')}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/${article.slug}">
    ${imageMetaUrl ? `<meta property="og:image" content="${imageMetaUrl}">` : ''}
    <meta property="article:author" content="${escapeHtml(article.author?.name || 'Search Termux')}">
    <meta property="article:section" content="${escapeHtml(categoryName)}">
    <meta property="article:published_time" content="${publishedISO}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(article.title)}">
    <meta name="twitter:description" content="${escapeHtml(article.excerpt || '')}">
    ${imageMetaUrl ? `<meta name="twitter:image" content="${imageMetaUrl}">` : ''}

    <style>
        /* CSS Reset & Base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; font-display: swap; overflow-x: hidden; }
        body { background: #0a0a0a; color: #e5e5e5; line-height: 1.6; overflow-x: hidden; }
        
        /* Page Container - Optimized for Ads */
        .page-container { min-height: 100vh; }
        .content-wrapper { max-width: 900px; margin: 0 auto; padding: 0 16px; }
        
        /* Ultra-Compact Article Header - Minimal Space */
        .article-header { padding: 8px 0 6px; text-align: center; }
        .article-title { font-size: 1.25rem; font-weight: 700; color: #e5e5e5; line-height: 1.1; margin-bottom: 4px; }
        .article-excerpt { font-size: 0.875rem; color: #a3a3a3; line-height: 1.3; }
        
        /* Maximum Hero Ad Space - 70% Viewport Priority */
        .ad-hero { 
            margin: 8px 0; 
            padding: 16px; 
            background: #111111; 
            border: 1px solid #262626; 
            border-radius: 8px; 
            text-align: center; 
            min-height: 70vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        
        /* Compact Article Content - Minimal Space */
        .article-content { background: #111111; border-radius: 8px; padding: 16px 12px; margin: 12px 0; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3); }
        .section-title { font-size: 1.125rem; font-weight: 600; color: #e5e5e5; margin-bottom: 8px; line-height: 1.2; }
        .section-body { font-size: 0.875rem; line-height: 1.5; color: #d1d5db; margin-bottom: 12px; }
        .section-body:last-child { margin-bottom: 0; }
        .section-body p { margin-bottom: 8px; }
        .section-body h1, .section-body h2, .section-body h3 { color: #e5e5e5; margin: 12px 0 6px; font-weight: 600; }
        .section-body h1 { font-size: 1.25rem; }
        .section-body h2 { font-size: 1.125rem; }
        .section-body h3 { font-size: 1rem; }
        .section-body ul, .section-body ol { margin: 8px 0; padding-left: 16px; }
        .section-body li { margin-bottom: 4px; }
        .section-body a { color: #60a5fa; text-decoration: none; }
        .section-body a:hover { text-decoration: underline; }
        .section-body code { background: #262626; color: #fbbf24; padding: 2px 4px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 0.8em; }
        .section-body pre { background: #1a1a1a; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 12px 0; border: 1px solid #262626; }
        .section-body pre code { background: none; padding: 0; border-radius: 0; }
        .section-body blockquote { border-left: 3px solid #3b82f6; padding-left: 12px; margin: 12px 0; color: #a3a3a3; font-style: italic; }
        
        /* Compact Article Image */
        .article-image-container { margin: 12px 0; text-align: center; }
        .article-image { max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); }
        
        /* Maximum Inline Ad Space */
        .ad-inline { 
            margin: 16px 0; 
            padding: 16px; 
            background: #0f0f0f; 
            border: 1px solid #262626; 
            border-radius: 8px; 
            text-align: center; 
            min-height: 60vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        
        /* Ultra-Compact Footer - Same as Search Page */
        .site-footer { background: #111111; border-top: 1px solid #262626; margin-top: 20px; }
        .footer-content { max-width: 1200px; margin: 0 auto; padding: 12px 16px; text-align: center; }
        .footer-links { display: flex; justify-content: center; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
        .footer-links a { color: #a3a3a3; text-decoration: none; font-size: 12px; transition: color 0.2s; }
        .footer-links a:hover { color: #e5e5e5; }
        .footer-text { color: #6b7280; font-size: 11px; }
        
        /* Tablet Responsive - Still Prioritize Ads */
        @media (min-width: 768px) {
            .content-wrapper { padding: 0 24px; }
            .article-header { padding: 12px 0 8px; }
            .article-title { font-size: 1.5rem; margin-bottom: 6px; }
            .article-excerpt { font-size: 1rem; }
            
            .ad-hero { margin: 12px 0; padding: 20px; min-height: 65vh; border-radius: 12px; }
            .article-content { padding: 20px; margin: 16px 0; border-radius: 12px; }
            .section-title { font-size: 1.375rem; margin-bottom: 12px; }
            .section-body { font-size: 1rem; line-height: 1.6; margin-bottom: 16px; }
            
            .ad-inline { margin: 24px 0; padding: 20px; min-height: 55vh; border-radius: 12px; }
        }
        
        /* Mobile Responsive - Compact Footer */
        @media (max-width: 768px) {
            .footer-content { padding: 8px 16px; }
            .footer-links { gap: 8px; }
            .footer-links a { font-size: 11px; }
            .footer-text { font-size: 10px; }
        }
        
        /* Desktop Responsive - Maximum Ad Coverage */
        @media (min-width: 1024px) {
            .article-title { font-size: 1.75rem; }
            .ad-hero { margin: 16px 0; min-height: 70vh; }
            .article-content { padding: 24px; }
            .ad-inline { margin: 32px 0; min-height: 60vh; }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="content-wrapper">
            <!-- Minimal Article Header - No Metadata -->
            <header class="article-header">
                <h1 class="article-title">${escapeHtml(article.title)}</h1>
                
            </header>

            <!-- Maximum Keyword Block Coverage - 70% Viewport -->
            <div class="ad-hero">
                <ins class="adsbygoogle"
                     style="display:block;width:100%;height:70vh;"
                     data-ad-client="ca-pub-XXXXXXXXX"
                     data-ad-slot="XXXXXXXXX"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>

            <!-- Article Content -->
            <main class="article-content">
                ${sectionsHtml}
            </main>
        </div>
    </div>

    <!-- Ultra-Compact Footer - Same as Search Page -->
    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="/">Home</a>
                <a href="/articles">Articles</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy</a>
            </div>
            <div class="footer-text">&copy; 2024 Search Termux. All rights reserved.</div>
        </div>
    </footer>

    <!-- AdSense & Scripts -->
    <script>
        // Initialize ads after page load
        function initAds() {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.log('AdSense initialization deferred');
            }
        }

        // Social sharing functionality
        function shareTwitter() {
            window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(document.title), '_blank', 'width=550,height=400');
        }

        function shareLinkedIn() {
            window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href), '_blank', 'width=550,height=400');
        }

        function copyLink() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Link copied to clipboard!');
            });
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            initAds();
        });
    </script>

    <!-- Structured Data -->
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${escapeHtml(article.title)}","description":"${escapeHtml(article.excerpt || '')}","author":{"@type":"Person","name":"${escapeHtml(article.author?.name || 'Search Termux')}"},"publisher":{"@type":"Organization","name":"Search Termux"},"datePublished":"${publishedISO}","articleSection":"${escapeHtml(categoryName)}"${imageMetaUrl ? `,"image":"${imageMetaUrl}"` : ''}}</script>
</body>
</html>`
} 
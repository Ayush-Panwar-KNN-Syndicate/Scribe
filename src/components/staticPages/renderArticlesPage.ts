interface StaticPageData {
  title: string
  description: string
  content?: string
  pageType: 'homepage' | 'contact' | 'privacy' | 'about' | 'terms' | 'articles' | 'search'
}

import { staticArticles } from '@/data/staticArticles'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}




export async function renderArticlesPage(): Promise<string> {
  const pageData: StaticPageData = {
    title: 'Articles - Search Termux',
    description: 'Browse our collection of diverse stories and articles about lifestyle, travel, culture, and more from our community of writers.',
    pageType: 'articles'
  }

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
    <link rel="dns-prefetch" href="//images.unsplash.com">
    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://pagead2.googlesyndication.com">
    <link rel="preconnect" href="https://imagedelivery.net">
    <link rel="preconnect" href="https://images.unsplash.com">
    
    <!-- Fonts -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>
    
    <!-- SEO Meta -->
    <title>${escapeHtml(pageData.title)}</title>
    <meta name="description" content="${escapeHtml(pageData.description)}">
    <meta name="robots" content="index, follow">
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/articles">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(pageData.title)}">
    <meta name="twitter:description" content="${escapeHtml(pageData.description)}">

    <style>
        /* CSS Reset & Base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; font-display: swap; overflow-x: hidden; }
        body { background: #0a0a0a; color: #e5e5e5; line-height: 1.6; overflow-x: hidden; }
        
        /* Site Header */
        .site-header { position: sticky; top: 0; z-index: 50; background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #262626; }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 60px; }
        .site-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #e5e5e5; font-weight: 600; font-size: 18px; }
        .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; }
        .site-name { color: #e5e5e5; }
        .header-nav { display: flex; gap: 32px; }
        .nav-link { color: #a3a3a3; text-decoration: none; font-weight: 500; font-size: 14px; transition: color 0.2s; }
        .nav-link:hover, .nav-link.active { color: #e5e5e5; }
        
        /* Page Container */
        .page-container { min-height: calc(100vh - 60px); padding-bottom: 120px; }
        .content-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        
        /* Article Header */
        .article-header { padding: 48px 0 32px; text-align: center; }
        .article-title { font-size: 2.5rem; font-weight: 700; color: #e5e5e5; line-height: 1.2; margin-bottom: 16px; }
        .article-excerpt { font-size: 1.125rem; color: #a3a3a3; line-height: 1.6; }
        
        /* Featured Articles */
        .featured-section { margin: 48px 0; }
        .section-title { font-size: 2rem; font-weight: 700; color: #e5e5e5; margin-bottom: 32px; text-align: center; }
        .articles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 32px; }
        .article-card { background: #111111; border: 1px solid #262626; border-radius: 20px; overflow: hidden; transition: all 0.3s ease; }
        .article-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border-color: #3b82f6; }
        .article-image { width: 100%; height: 240px; object-fit: cover; background: linear-gradient(135deg, #1a1a1a, #262626); }
        .article-content { padding: 28px; }
        .article-card-title { font-size: 1.375rem; font-weight: 600; color: #e5e5e5; margin-bottom: 16px; line-height: 1.3; }
        .article-card-excerpt { color: #a3a3a3; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; }
        .article-card-meta { display: flex; justify-content: space-between; align-items: center; }
        .article-card-category { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
        .article-card-date { color: #737373; font-size: 0.875rem; }
        .article-card-author { color: #a3a3a3; font-size: 0.875rem; margin-top: 12px; }
        
        /* Inline Ad */
        .ad-inline { margin: 80px 0; padding: 32px; background: #0f0f0f; border: 1px solid #262626; border-radius: 16px; text-align: center; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        
        /* Site Footer */
        .site-footer { background: #0a0a0a; border-top: 1px solid #262626; padding: 64px 0 32px; margin-top: 80px; }
        .footer-content { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 48px; margin-bottom: 48px; }
        .footer-section h3 { color: #e5e5e5; font-weight: 600; margin-bottom: 20px; font-size: 16px; }
        .footer-section ul { list-style: none; }
        .footer-section li { margin-bottom: 12px; }
        .footer-section a { color: #a3a3a3; text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-section a:hover { color: #e5e5e5; }
        .footer-brand { grid-column: span 1; }
        .footer-brand-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .footer-brand-text { color: #a3a3a3; font-size: 14px; line-height: 1.6; }
        .footer-bottom { padding-top: 32px; border-top: 1px solid #262626; text-align: center; color: #737373; font-size: 14px; }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .header-content { padding: 0 16px; }
            .header-nav { display: none; }
            .content-wrapper { padding: 0 16px; }
            .article-header { padding: 32px 0 24px; }
            .article-title { font-size: 2rem; }
            .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
            .articles-grid { grid-template-columns: 1fr; gap: 24px; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        
        @media (max-width: 480px) {
            .article-title { font-size: 1.75rem; }
            .section-title { font-size: 1.5rem; }
            .footer-grid { grid-template-columns: 1fr; gap: 24px; }
        }
    </style>
</head>
<body>
    <header class="site-header">
        <div class="header-content">
            <a href="/" class="site-logo">
                <div class="logo-icon">S</div>
                <span class="site-name">Search Termux</span>
            </a>
            <nav class="header-nav">
                <a href="/" class="nav-link">Home</a>
                <a href="/articles" class="nav-link active">Articles</a>
                <a href="/about" class="nav-link">About</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
        </div>
    </header>

    <div class="page-container">
        <div class="content-wrapper">
            <header class="article-header">
                <h1 class="article-title">Articles</h1>
                <p class="article-excerpt">
                    Browse our collection of diverse stories and articles about lifestyle, travel, culture, and more from our community of writers.
                </p>
            </header>

         

            <section class="featured-section">
                <h2 class="section-title">Latest Articles</h2>
                <div class="articles-grid">
                    ${staticArticles.slice(0, 12).map(article => `
                    <a href="/${article.slug}" class="article-card" style="text-decoration: none; color: inherit;">
                        <img src="${article.imageUrl}?w=600&h=240&fit=crop&crop=faces,edge" alt="${escapeHtml(article.title)}" class="article-image" loading="lazy">
                        <div class="article-content">
                            <h3 class="article-card-title">${escapeHtml(article.title)}</h3>
                            <p class="article-card-excerpt">${escapeHtml(article.excerpt)}</p>
                            <div class="article-card-meta">
                                <span class="article-card-category">${escapeHtml(article.category)}</span>
                                <span class="article-card-date">${new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div class="article-card-author">By ${escapeHtml(article.author)} • ${escapeHtml(article.readTime)}</div>
                        </div>
                    </a>
                    `).join('')}
                </div>
            </section>

         
        </div>
    </div>

    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-grid">
                <div class="footer-section footer-brand">
                    <div class="footer-brand-logo">
                        <div class="logo-icon">S</div>
                        <span class="site-name">Search Termux</span>
                    </div>
                    <p class="footer-brand-text">
                        Technology insights, programming tutorials, and digital innovation content for developers and tech enthusiasts worldwide.
                    </p>
                </div>

                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/articles">Articles</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Popular Topics</h3>
                    <ul>
                        <li><a href="/topics/programming">Programming</a></li>
                        <li><a href="/topics/web-development">Web Development</a></li>
                        <li><a href="/topics/ai-ml">AI & Machine Learning</a></li>
                        <li><a href="/topics/devops">DevOps</a></li>
                        <li><a href="/topics/mobile">Mobile Development</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Use</a></li>
                        <li><a href="/sitemap">Sitemap</a></li>
                        <li><a href="/rss">RSS Feed</a></li>
                        <li><a href="/newsletter">Newsletter</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Search Termux. All rights reserved. Community-driven content platform.</p>
            </div>
        </div>
    </footer>
    
    <!-- AdSense & Scripts -->
    <script>
      

        document.addEventListener('DOMContentLoaded', function() {
            // Newsletter form
            const newsletterForm = document.querySelector('.newsletter-form');
            if (newsletterForm) {
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = this.querySelector('.newsletter-input').value;
                    if (email) {
                        alert('Thank you for subscribing!');
                        this.querySelector('.newsletter-input').value = '';
                    }
                });
            }
        });
    </script>

    <!-- Structured Data -->
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"Articles - Search Termux","description":"Browse our collection of diverse stories and articles about lifestyle, travel, culture, and more from our community of writers.","url":"${process.env.R2_PUBLIC_URL}/articles","isPartOf":{"@type":"WebSite","name":"Search Termux","url":"${process.env.R2_PUBLIC_URL}/"},"publisher":{"@type":"Organization","name":"Search Termux"}}</script>
</body>
</html>`
}
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



export async function renderStaticArticle(articleId: string): Promise<string> {
  const article = staticArticles.find(a => a.id === articleId)
  
  if (!article) {
    throw new Error(`Article with id ${articleId} not found`)
  }

  const pageData: StaticPageData = {
    title: `${article.title} - Search Termux`,
    description: article.excerpt,
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
    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://pagead2.googlesyndication.com">
    <link rel="preconnect" href="https://imagedelivery.net">
    
    <!-- Fonts -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>
    
    <!-- SEO Meta -->
    <title>${escapeHtml(pageData.title)}</title>
    <meta name="description" content="${escapeHtml(pageData.description)}">
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="${escapeHtml(article.category)}, blog, articles, ${escapeHtml(article.title.toLowerCase())}">
    <meta name="author" content="${escapeHtml(article.author)}">
    <link rel="canonical" href="${process.env.R2_PUBLIC_URL}/${escapeHtml(article.slug)}">
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/${escapeHtml(article.slug)}">
    <meta property="og:image" content="${escapeHtml(article.imageUrl)}">
    <meta property="article:author" content="${escapeHtml(article.author)}">
    <meta property="article:published_time" content="${article.publishDate}">
    <meta property="article:section" content="${escapeHtml(article.category)}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(pageData.title)}">
    <meta name="twitter:description" content="${escapeHtml(pageData.description)}">
    <meta name="twitter:image" content="${escapeHtml(article.imageUrl)}">

    <style>
        /* CSS Reset & Base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; font-display: swap; overflow-x: hidden; }
        body { background: #0a0a0a; color: #e5e5e5; line-height: 1.6; overflow-x: hidden; }
        
        /* Site Header */
        .site-header { position: sticky; top: 0; z-index: 50; background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #262626; height: 64px; }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 100%; }
        .site-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #e5e5e5; font-weight: 600; font-size: 18px; }
        .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; }
        .site-name { color: #e5e5e5; }
        .header-nav { display: flex; gap: 32px; }
        .nav-link { color: #a3a3a3; text-decoration: none; font-weight: 500; font-size: 14px; transition: color 0.2s; }
        .nav-link:hover { color: #e5e5e5; }
        
        /* Article Container */
        .article-container { max-width: 800px; margin: 0 auto; padding: 0 24px; min-height: calc(100vh - 64px); }
        
        /* Article Header */
        .article-header { padding: 48px 0 32px; }
        .article-category { display: inline-block; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
        .article-title { font-size: 2.5rem; font-weight: 700; color: #e5e5e5; line-height: 1.2; margin-bottom: 16px; }
        .article-excerpt { font-size: 1.125rem; color: #a3a3a3; line-height: 1.6; margin-bottom: 24px; }
        .article-meta { display: flex; align-items: center; gap: 16px; color: #737373; font-size: 14px; margin-bottom: 32px; }
        .article-author { font-weight: 500; }
        
        /* Article Image */
        .article-image { width: 100%; height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 32px; }
        
        /* Hero Ad */
        .ad-hero { margin: 32px 0; padding: 48px; background: #0f0f0f; border: 2px solid #262626; border-radius: 16px; text-align: center; min-height: 70vh; display: flex; align-items: center; justify-content: center; }
        
        /* Article Content */
        .article-content { margin-bottom: 48px; }
        .content-section { margin-bottom: 32px; }
        .content-section h2 { font-size: 1.5rem; font-weight: 600; color: #e5e5e5; margin-bottom: 16px; }
        .content-section p { color: #a3a3a3; line-height: 1.7; margin-bottom: 16px; }
        
        /* Inline Ad */
        .ad-inline { margin: 48px 0; padding: 32px; background: #0f0f0f; border: 1px solid #262626; border-radius: 16px; text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; }
        
        /* Site Footer */
        .site-footer { background: #0a0a0a; border-top: 1px solid #262626; padding: 32px 0; margin-top: 48px; }
        .footer-content { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .footer-links { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
        .footer-link { color: #a3a3a3; text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-link:hover { color: #e5e5e5; }
        .footer-bottom { text-align: center; color: #737373; font-size: 14px; }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .header-content { padding: 0 16px; }
            .header-nav { display: none; }
            .article-container { padding: 0 16px; }
            .article-header { padding: 32px 0 24px; }
            .article-title { font-size: 2rem; }
            .article-image { height: 250px; }
            .ad-hero { padding: 32px 24px; min-height: 60vh; }
            .ad-inline { padding: 24px 16px; min-height: 50vh; }
            .footer-links { gap: 16px; }
        }
        
        @media (max-width: 480px) {
            .article-title { font-size: 1.75rem; }
            .footer-links { flex-direction: column; align-items: center; gap: 12px; }
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
                <a href="/articles" class="nav-link">Articles</a>
                <a href="/about" class="nav-link">About</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
        </div>
    </header>

    <main class="article-container">
        <article>
            <header class="article-header">
                <div class="article-category">${escapeHtml(article.category)}</div>
                <h1 class="article-title">${escapeHtml(article.title)}</h1>
                <p class="article-excerpt">${escapeHtml(article.excerpt)}</p>
                <div class="article-meta">
                    <span class="article-author">By ${escapeHtml(article.author)}</span>
                    <span>•</span>
                    <span>${new Date(article.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>${escapeHtml(article.readTime)}</span>
                </div>
            </header>

            <img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" class="article-image" loading="lazy">
            
           

            <div class="article-content">
                ${article.sections.map((section, index) => `
                    <section class="content-section">
                        <h2>${escapeHtml(section.header)}</h2>
                        ${section.content}
                        ${index === Math.floor(article.sections.length / 2) ? `
                            <div class="ad-inline">
                             
                            </div>
                        ` : ''}
                    </section>
                `).join('')}
            </div>
        </article>
    </main>

    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="/" class="footer-link">Home</a>
                <a href="/articles" class="footer-link">Articles</a>
                <a href="/about" class="footer-link">About</a>
                <a href="/contact" class="footer-link">Contact</a>
                <a href="/privacy" class="footer-link">Privacy</a>
                <a href="/terms" class="footer-link">Terms</a>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Search Termux. All rights reserved.</p>
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
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${escapeHtml(article.title)}","description":"${escapeHtml(article.excerpt)}","image":"${escapeHtml(article.imageUrl)}","author":{"@type":"Person","name":"${escapeHtml(article.author)}"},"publisher":{"@type":"Organization","name":"Search Termux","url":"${process.env.R2_PUBLIC_URL}","logo":{"@type":"ImageObject","url":"${process.env.R2_PUBLIC_URL}/logo.png"}},"datePublished":"${article.publishDate}","dateModified":"${article.publishDate}","mainEntityOfPage":{"@type":"WebPage","@id":"${process.env.R2_PUBLIC_URL}/${escapeHtml(article.slug)}"},"url":"${process.env.R2_PUBLIC_URL}/${escapeHtml(article.slug)}"}</script>
</body>
</html>`
}
/**
 * Static Page Renderer for Homepage, Contact Us, Privacy Policy, About, Terms of Use, Articles
 * Uses the same performance optimizations as article pages
 */

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

/**
 * Render Homepage with professional design
 */
export async function renderHomepage(): Promise<string> {
  const pageData: StaticPageData = {
    title: 'Search Termux - Discover Amazing Content',
    description: 'A vibrant community blog platform featuring diverse articles, stories, and insights from writers around the world.',
    pageType: 'homepage'
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
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16540992045"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-16540992045');
    </script>
    
    <!-- AdSense for Search -->
    <script async="async" src="https://www.google.com/adsense/search/ads.js"></script>
    <script type="text/javascript" charset="utf-8">
    (function(g,o){g[o]=g[o]||function(){(g[o]['q']=g[o]['q']||[]).push(
      arguments)},g[o]['t']=1*new Date})(window,'_googCsa');
    </script>
    
    <!-- SEO Meta -->
    <title>${escapeHtml(pageData.title)}</title>
    <meta name="description" content="${escapeHtml(pageData.description)}">
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="search, blog articles, stories, lifestyle, travel, food, culture, entertainment, writing, community">
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/">
    <meta property="og:image" content="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(pageData.title)}">
    <meta name="twitter:description" content="${escapeHtml(pageData.description)}">
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop">

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
        .page-container { min-height: calc(100vh - 60px); }
        .content-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        
        /* Hero Section */
        .hero-section { padding: 80px 0 60px; position: relative; }
        .hero-content { text-align: center; max-width: 800px; margin: 0 auto; }
        .hero-badge { display: inline-block; background: linear-gradient(135deg, #1a1a1a, #262626); border: 1px solid #374151; border-radius: 24px; padding: 8px 20px; margin-bottom: 32px; font-size: 14px; color: #a3a3a3; font-weight: 500; }
        .hero-title { font-size: 3.5rem; font-weight: 700; color: #e5e5e5; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.02em; }
        .hero-subtitle { font-size: 1.25rem; color: #a3a3a3; line-height: 1.6; margin-bottom: 40px; font-weight: 400; }
        .hero-actions { flex-direction: column; align-items: stretch; margin-bottom: 60px; }
        .btn-primary { padding: 14px 28px; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3); }
        .btn-secondary { padding: 14px 28px; background: transparent; color: #e5e5e5; text-decoration: none; border: 1px solid #374151; border-radius: 10px; font-weight: 600; font-size: 15px; transition: all 0.3s ease; }
        .btn-secondary:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        
        /* Hero Search Box */
        .hero-search { max-width: 600px; margin: 0 auto 60px; }
        .hero-search-form { display: flex; gap: 12px; }
        .hero-search-input { 
            flex: 1; 
            padding: 16px 20px; 
            background: #111111; 
            border: 2px solid #374151; 
            border-radius: 12px; 
            color: #e5e5e5; 
            font-size: 16px; 
            outline: none; 
            transition: all 0.3s ease;
            min-width: 0;
        }
        .hero-search-input:focus { 
            border-color: #3b82f6; 
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .hero-search-input::placeholder { color: #6b7280; }
        .hero-search-btn { 
            padding: 16px 24px; 
            background: linear-gradient(135deg, #3b82f6, #06b6d4); 
            color: white; 
            border: none; 
            border-radius: 12px; 
            font-size: 16px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.3s ease;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .hero-search-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }
        .hero-search-btn:disabled { 
            background: #374151; 
            cursor: not-allowed; 
            opacity: 0.7;
            transform: none;
            box-shadow: none;
        }
        
        /* Platform Stats */
        .platform-stats { display: flex; justify-content: center; gap: 48px; margin-bottom: 80px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 2rem; font-weight: 700; color: #e5e5e5; margin-bottom: 4px; }
        .stat-label { font-size: 0.875rem; color: #737373; font-weight: 500; }
        
        /* Content Grid */
        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 60px; margin-bottom: 80px; }
        
        /* Main Content */
        .main-content { }
        .section-header { margin-bottom: 40px; }
        .section-title { font-size: 1.75rem; font-weight: 700; color: #e5e5e5; margin-bottom: 12px; }
        .section-description { color: #a3a3a3; font-size: 1rem; line-height: 1.6; }
        
        /* Featured Articles */
        .featured-articles { }
        .article-list { display: flex; flex-direction: column; gap: 24px; }
        .article-item { display: flex; gap: 20px; padding: 24px; background: #111111; border: 1px solid #262626; border-radius: 12px; transition: all 0.3s ease; text-decoration: none; color: inherit; }
        .article-item:hover { border-color: #3b82f6; transform: translateY(-4px); }
        .article-image { width: 140px; height: 100px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
        .article-info { flex: 1; }
        .article-category { display: inline-block; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; }
        .article-title { font-size: 1.125rem; font-weight: 600; color: #e5e5e5; margin-bottom: 8px; line-height: 1.4; }
        .article-excerpt { color: #a3a3a3; font-size: 0.875rem; line-height: 1.5; margin-bottom: 12px; }
        .article-meta { display: flex; align-items: center; gap: 16px; color: #737373; font-size: 0.75rem; }
        
        /* Sidebar */
        .sidebar { }
        .sidebar-section { background: #111111; border: 1px solid #262626; border-radius: 12px; padding: 28px; margin-bottom: 24px; }
        .sidebar-title { font-size: 1.125rem; font-weight: 600; color: #e5e5e5; margin-bottom: 20px; }
        
        /* Recent Updates */
        .update-list { display: flex; flex-direction: column; gap: 16px; }
        .update-item { padding-bottom: 16px; border-bottom: 1px solid #262626; }
        .update-item:last-child { border-bottom: none; padding-bottom: 0; }
        .update-title { font-size: 0.875rem; font-weight: 600; color: #e5e5e5; margin-bottom: 4px; line-height: 1.4; }
        .update-date { color: #737373; font-size: 0.75rem; }
        
        /* Topic Links */
        .topic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .topic-link { display: block; padding: 12px 16px; background: #1a1a1a; border: 1px solid #374151; border-radius: 8px; text-decoration: none; color: #a3a3a3; font-size: 0.875rem; font-weight: 500; text-align: center; transition: all 0.2s ease; }
        .topic-link:hover { border-color: #3b82f6; color: #e5e5e5; background: rgba(59, 130, 246, 0.1); }
        
        /* Newsletter CTA */
        .newsletter-cta { background: linear-gradient(135deg, #1a1a1a, #262626); border: 1px solid #374151; text-align: center; }
        .newsletter-title { margin-bottom: 12px; }
        .newsletter-text { color: #a3a3a3; font-size: 0.875rem; margin-bottom: 20px; line-height: 1.5; }
        .newsletter-form { display: flex; flex-direction: column; gap: 12px; }
        .newsletter-input { padding: 12px 16px; background: #0a0a0a; border: 1px solid #374151; border-radius: 8px; color: #e5e5e5; font-size: 14px; }
        .newsletter-button { padding: 12px 16px; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        
        /* Inline Ad */
        .ad-inline { margin: 60px 0; padding: 32px; background: #0f0f0f; border: 1px solid #262626; border-radius: 16px; text-align: center; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        
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
        @media (max-width: 1024px) {
            .content-grid { grid-template-columns: 1fr; gap: 40px; }
            .platform-stats { gap: 32px; }
        }
        
        @media (max-width: 768px) {
            .header-content { padding: 0 16px; }
            .header-nav { display: none; }
            .content-wrapper { padding: 0 16px; }
            .hero-section { padding: 60px 0 40px; }
            .hero-title { font-size: 2.5rem; }
            .hero-subtitle { font-size: 1.125rem; }
            .hero-actions { flex-direction: column; align-items: stretch; }
            .platform-stats { display: none; } /* Hide platform stats on mobile */
            .article-item { flex-direction: column; gap: 16px; }
            .article-image { width: 100%; height: 180px; }
            .topic-grid { grid-template-columns: 1fr; }
            .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
            
            /* Hero search mobile styles */
            .hero-search { max-width: 100%; margin: 0 auto 40px; }
            .hero-search-form { flex-direction: column; gap: 12px; }
            .hero-search-input { padding: 14px 16px; font-size: 16px; }
            .hero-search-btn { padding: 14px 16px; font-size: 16px; }
        }
        
        @media (max-width: 480px) {
            .hero-title { font-size: 2rem; }
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
                <a href="/" class="nav-link active">Home</a>
                <a href="/articles" class="nav-link">Articles</a>
                <a href="/about" class="nav-link">About</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
        </div>
    </header>

    <div class="page-container">
        <div class="content-wrapper">
            <!-- Hero Section -->
            <section class="hero-section">
                <div class="hero-content">
                    <div class="hero-badge">Diverse Content & Stories</div>
                    <h1 class="hero-title">Discover Stories That Matter</h1>
                    <p class="hero-subtitle">
                        Explore a world of diverse content - from lifestyle and travel to food, culture, and personal stories shared by our community of writers.
                    </p>
                </div>
                
                <div class="hero-search">
                    <form class="hero-search-form">
                        <input type="text" class="hero-search-input" placeholder="Search stories, articles, topics..." required>
                        <button type="submit" class="hero-search-btn" disabled>Search</button>
                    </form>
                </div>
                
                <div class="platform-stats">
                    <div class="stat-item">
                        <div class="stat-value">1000+</div>
                        <div class="stat-label">Stories</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">50K+</div>
                        <div class="stat-label">Readers</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">100+</div>
                        <div class="stat-label">Writers</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">25</div>
                        <div class="stat-label">Categories</div>
                    </div>
                </div>
            </section>

            <div class="ad-inline">
              
            </div>

            <!-- Content Grid -->
            <div class="content-grid">
                <!-- Main Content -->
                <main class="main-content">
                    <div class="section-header">
                        <h2 class="section-title">Latest Stories</h2>
                        <p class="section-description">
                            Discover fresh perspectives and engaging content from our diverse community of writers and storytellers.
                        </p>
                    </div>
                    
                    <div class="featured-articles">
                        <div class="article-list">
                            <a href="/${staticArticles[0].slug}" class="article-item">
                                <img src="${staticArticles[0].imageUrl}?w=140&h=100&fit=crop&crop=faces,edge" alt="${escapeHtml(staticArticles[0].title)}" class="article-image" loading="lazy">
                                <div class="article-info">
                                    <span class="article-category">${escapeHtml(staticArticles[0].category)}</span>
                                    <h3 class="article-title">${escapeHtml(staticArticles[0].title)}</h3>
                                    <p class="article-excerpt">${escapeHtml(staticArticles[0].excerpt)}</p>
                                    <div class="article-meta">
                                        <span>${escapeHtml(staticArticles[0].author)}</span>
                                        <span>${escapeHtml(staticArticles[0].readTime)}</span>
                                        <span>${new Date(staticArticles[0].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </a>

                            <a href="/${staticArticles[1].slug}" class="article-item">
                                <img src="${staticArticles[1].imageUrl}?w=140&h=100&fit=crop&crop=faces,edge" alt="${escapeHtml(staticArticles[1].title)}" class="article-image" loading="lazy">
                                <div class="article-info">
                                    <span class="article-category">${escapeHtml(staticArticles[1].category)}</span>
                                    <h3 class="article-title">${escapeHtml(staticArticles[1].title)}</h3>
                                    <p class="article-excerpt">${escapeHtml(staticArticles[1].excerpt)}</p>
                                    <div class="article-meta">
                                        <span>${escapeHtml(staticArticles[1].author)}</span>
                                        <span>${escapeHtml(staticArticles[1].readTime)}</span>
                                        <span>${new Date(staticArticles[1].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </a>

                            <a href="/${staticArticles[2].slug}" class="article-item">
                                <img src="${staticArticles[2].imageUrl}?w=140&h=100&fit=crop&crop=faces,edge" alt="${escapeHtml(staticArticles[2].title)}" class="article-image" loading="lazy">
                                <div class="article-info">
                                    <span class="article-category">${escapeHtml(staticArticles[2].category)}</span>
                                    <h3 class="article-title">${escapeHtml(staticArticles[2].title)}</h3>
                                    <p class="article-excerpt">${escapeHtml(staticArticles[2].excerpt)}</p>
                                    <div class="article-meta">
                                        <span>${escapeHtml(staticArticles[2].author)}</span>
                                        <span>${escapeHtml(staticArticles[2].readTime)}</span>
                                        <span>${new Date(staticArticles[2].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </a>

                            <a href="/${staticArticles[3].slug}" class="article-item">
                                <img src="${staticArticles[3].imageUrl}?w=140&h=100&fit=crop&crop=faces,edge" alt="${escapeHtml(staticArticles[3].title)}" class="article-image" loading="lazy">
                                <div class="article-info">
                                    <span class="article-category">${escapeHtml(staticArticles[3].category)}</span>
                                    <h3 class="article-title">${escapeHtml(staticArticles[3].title)}</h3>
                                    <p class="article-excerpt">${escapeHtml(staticArticles[3].excerpt)}</p>
                                    <div class="article-meta">
                                        <span>${escapeHtml(staticArticles[3].author)}</span>
                                        <span>${escapeHtml(staticArticles[3].readTime)}</span>
                                        <span>${new Date(staticArticles[3].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </a>

                            <a href="/${staticArticles[4].slug}" class="article-item">
                                <img src="${staticArticles[4].imageUrl}?w=140&h=100&fit=crop&crop=faces,edge" alt="${escapeHtml(staticArticles[4].title)}" class="article-image" loading="lazy">
                                <div class="article-info">
                                    <span class="article-category">${escapeHtml(staticArticles[4].category)}</span>
                                    <h3 class="article-title">${escapeHtml(staticArticles[4].title)}</h3>
                                    <p class="article-excerpt">${escapeHtml(staticArticles[4].excerpt)}</p>
                                    <div class="article-meta">
                                        <span>${escapeHtml(staticArticles[4].author)}</span>
                                        <span>${escapeHtml(staticArticles[4].readTime)}</span>
                                        <span>${new Date(staticArticles[4].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </main>

                <!-- Sidebar -->
                <aside class="sidebar">
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Recent Updates</h3>
                        <div class="update-list">
                            <div class="update-item">
                                <div class="update-title">${escapeHtml(staticArticles[5].title)}</div>
                                <div class="update-date">${new Date(staticArticles[5].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <div class="update-item">
                                <div class="update-title">${escapeHtml(staticArticles[6].title)}</div>
                                <div class="update-date">${new Date(staticArticles[6].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <div class="update-item">
                                <div class="update-title">${escapeHtml(staticArticles[7].title)}</div>
                                <div class="update-date">${new Date(staticArticles[7].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <div class="update-item">
                                <div class="update-title">${escapeHtml(staticArticles[8].title)}</div>
                                <div class="update-date">${new Date(staticArticles[8].publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Browse Topics</h3>
                        <div class="topic-grid">
                            <a href="/topics/lifestyle" class="topic-link">Lifestyle</a>
                            <a href="/topics/travel" class="topic-link">Travel</a>
                            <a href="/topics/food" class="topic-link">Food</a>
                            <a href="/topics/health" class="topic-link">Health</a>
                            <a href="/topics/entertainment" class="topic-link">Entertainment</a>
                            <a href="/topics/culture" class="topic-link">Culture</a>
                        </div>
                    </div>

                    <div class="sidebar-section newsletter-cta">
                        <h3 class="sidebar-title newsletter-title">Stay Updated</h3>
                        <p class="newsletter-text">Get weekly insights delivered to your inbox.</p>
                        <form class="newsletter-form">
                            <input type="email" class="newsletter-input" placeholder="Enter your email" required>
                            <button type="submit" class="newsletter-button">Subscribe</button>
                        </form>
                    </div>
                </aside>
            </div>

         
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
                        A vibrant community blog platform where writers share diverse stories, experiences, and insights from around the world.
                    </p>
                </div>

                <div class="footer-section">
                    <h3>Content</h3>
                    <ul>
                        <li><a href="/articles">All Stories</a></li>
                        <li><a href="/featured">Featured</a></li>
                        <li><a href="/popular">Popular</a></li>
                        <li><a href="/writers">Writers</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Categories</h3>
                    <ul>
                        <li><a href="/topics/lifestyle">Lifestyle</a></li>
                        <li><a href="/topics/travel">Travel & Adventure</a></li>
                        <li><a href="/topics/food">Food & Culture</a></li>
                        <li><a href="/topics/health">Health & Wellness</a></li>
                        <li><a href="/topics/entertainment">Entertainment</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="/about">About</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/privacy">Privacy</a></li>
                        <li><a href="/terms">Terms</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Search Termux. All rights reserved. Community-driven content platform.</p>
            </div>
        </div>
    </footer>
    

    <script>
     

        document.addEventListener('DOMContentLoaded', function() {
            // Hero search form
            const heroSearchForm = document.querySelector('.hero-search-form');
            const heroSearchInput = document.querySelector('.hero-search-input');
            const heroSearchBtn = document.querySelector('.hero-search-btn');
            
            if (heroSearchForm && heroSearchInput && heroSearchBtn) {
                // Enable search button when input has content
                heroSearchInput.addEventListener('input', function() {
                    const query = this.value.trim();
                    heroSearchBtn.disabled = query.length < 2;
                });
                
                // Handle search form submission
                heroSearchForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const query = heroSearchInput.value.trim();
                    
                    if (query.length >= 2) {
                        // Redirect to search page with query
                        window.location.href = '/search?q=' + encodeURIComponent(query);
                    }
                });
                
                // Handle Enter key
                heroSearchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        heroSearchForm.dispatchEvent(new Event('submit'));
                    }
                });
            }
            
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
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Search Termux","description":"A vibrant community blog platform featuring diverse articles, stories, and insights from writers around the world.","url":"${process.env.R2_PUBLIC_URL}/","publisher":{"@type":"Organization","name":"Search Termux","url":"${process.env.R2_PUBLIC_URL}/"}}</script>
</body>
</html>`
}
/**
 * Render Contact Us page
 */
export async function renderContactPage(): Promise<string> {
  const pageData: StaticPageData = {
    title: 'Contact Us - Search Termux',
    description: 'Get in touch with the Search Termux team. We\'d love to hear from you about collaborations, feedback, or any questions.',
    pageType: 'contact'
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
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/contact">
    
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
        .content-wrapper { max-width: 900px; margin: 0 auto; padding: 0 24px; }
        
        /* Article Header */
        .article-header { padding: 48px 0 32px; text-align: center; }
        .article-title { font-size: 2.5rem; font-weight: 700; color: #e5e5e5; line-height: 1.2; margin-bottom: 16px; }
        .article-excerpt { font-size: 1.125rem; color: #a3a3a3; line-height: 1.6; }
        
        /* Hero Ad */
        .ad-hero { margin: 48px 0; padding: 24px; background: #111111; border: 1px solid #262626; border-radius: 12px; text-align: center; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        
        /* Article Content */
        .article-content { background: #111111; border-radius: 16px; padding: 48px; margin: 48px 0; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); contain: layout; }
        .section-title { font-size: 1.75rem; font-weight: 600; color: #e5e5e5; margin-bottom: 24px; line-height: 1.3; }
        .section-body { font-size: 1.125rem; line-height: 1.7; color: #d1d5db; margin-bottom: 40px; }
        .section-body:last-child { margin-bottom: 0; }
        .section-body p { margin-bottom: 20px; }
        
        /* Contact Info Grid */
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; margin: 32px 0; }
        .contact-card { background: #1a1a1a; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #262626; }
        .contact-icon { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #06b6d4); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 24px; }
        .contact-title { font-size: 1.125rem; font-weight: 600; color: #e5e5e5; margin-bottom: 8px; }
        .contact-info { color: #a3a3a3; font-size: 0.875rem; line-height: 1.5; }
        
        /* Contact Form */
        .contact-form { margin: 32px 0; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { color: #e5e5e5; font-weight: 500; font-size: 0.875rem; }
        .form-input, .form-textarea { background: #1a1a1a; border: 1px solid #262626; border-radius: 8px; padding: 12px 16px; color: #e5e5e5; font-size: 0.875rem; transition: border-color 0.2s; }
        .form-input:focus, .form-textarea:focus { outline: none; border-color: #3b82f6; }
        .form-textarea { resize: vertical; min-height: 120px; }
        .form-button { background: #3b82f6; color: white; border: none; border-radius: 8px; padding: 12px 24px; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: background-color 0.2s; }
        .form-button:hover { background: #2563eb; }
        
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
            .article-content { padding: 32px 24px; }
            .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
            .contact-grid { grid-template-columns: 1fr; gap: 24px; }
            .form-grid { grid-template-columns: 1fr; }
        }
        
        @media (max-width: 480px) {
            .article-title { font-size: 1.75rem; }
            .section-title { font-size: 1.5rem; }
            .footer-grid { grid-template-columns: 1fr; gap: 24px; }
            .stats-grid { grid-template-columns: 1fr; gap: 16px; }
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
                <a href="/categories" class="nav-link">Categories</a>
                <a href="/about" class="nav-link">About</a>
                <a href="/contact" class="nav-link active">Contact</a>
            </nav>
        </div>
    </header>

    <div class="page-container">
        <div class="content-wrapper">
            <header class="article-header">
                <h1 class="article-title">Contact Us</h1>
                <p class="article-excerpt">
                    Get in touch with the Search Termux team. We'd love to hear from you about collaborations, feedback, or any questions you might have.
                </p>
            </header>

            <div class="ad-hero">
               
            </div>

            <main class="article-content">
                <section>
                    <h2 class="section-title">Get in Touch</h2>
                    <div class="section-body">
                        <p>
                            We're always excited to connect with our community of developers, tech enthusiasts, and industry professionals. Whether you have questions, feedback, collaboration ideas, or just want to say hello, we'd love to hear from you.
                        </p>
                        
                        <div class="contact-grid">
                            <div class="contact-card">
                                <div class="contact-icon">📧</div>
                                <div class="contact-title">Email Us</div>
                                <div class="contact-info">
                                    hello@searchtermux.com<br>
                                    editorial@searchtermux.com
                                </div>
                            </div>
                            <div class="contact-card">
                                <div class="contact-icon">💬</div>
                                <div class="contact-title">Community</div>
                                <div class="contact-info">
                                    Join our Discord community<br>
                                    Follow us on social media
                                </div>
                            </div>
                            <div class="contact-card">
                                <div class="contact-icon">🏢</div>
                                <div class="contact-title">Office</div>
                                <div class="contact-info">
                                    San Francisco, CA<br>
                                    Remote-first team
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 class="section-title">Send us a Message</h2>
                    <div class="section-body">
                        <form class="contact-form" action="#" method="POST">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label" for="name">Name</label>
                                    <input class="form-input" type="text" id="name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="email">Email</label>
                                    <input class="form-input" type="email" id="email" name="email" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="subject">Subject</label>
                                <input class="form-input" type="text" id="subject" name="subject" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="message">Message</label>
                                <textarea class="form-textarea" id="message" name="message" rows="6" required></textarea>
                            </div>
                            <button class="form-button" type="submit">Send Message</button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="footer-brand-logo">
                        <div class="logo-icon">S</div>
                        <span class="site-name">Search Termux</span>
                    </div>
                    <p class="footer-brand-text">
                        A vibrant community blog platform where writers share diverse stories, experiences, and insights from around the world.
                    </p>
                </div>

                <div class="footer-section">
                    <h3>Content</h3>
                    <ul>
                        <li><a href="/articles">All Stories</a></li>
                        <li><a href="/featured">Featured</a></li>
                        <li><a href="/popular">Popular</a></li>
                        <li><a href="/writers">Writers</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Categories</h3>
                    <ul>
                        <li><a href="/topics/lifestyle">Lifestyle</a></li>
                        <li><a href="/topics/travel">Travel & Adventure</a></li>
                        <li><a href="/topics/food">Food & Culture</a></li>
                        <li><a href="/topics/health">Health & Wellness</a></li>
                        <li><a href="/topics/entertainment">Entertainment</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="/about">About</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/privacy">Privacy</a></li>
                        <li><a href="/terms">Terms</a></li>
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
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"ContactPage","name":"Contact Search Termux","description":"Get in touch with the Search Termux team for collaborations, feedback, or questions.","url":"${process.env.R2_PUBLIC_URL}/contact","publisher":{"@type":"Organization","name":"Search Termux","url":"${process.env.R2_PUBLIC_URL}","contactPoint":{"@type":"ContactPoint","email":"hello@searchtermux.com","contactType":"customer service"}}}</script>
</body>
</html>`
}

/**
 * Render Privacy Policy page
 */
export async function renderPrivacyPage(): Promise<string> {
  const pageData: StaticPageData = {
    title: 'Privacy Policy - Search Termux',
    description: 'Learn how Search Termux collects, uses, and protects your personal information. Our commitment to your privacy and data security.',
    pageType: 'privacy'
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
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/privacy">
    
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
        .content-wrapper { max-width: 900px; margin: 0 auto; padding: 0 24px; }
        
        /* Article Header */
        .article-header { padding: 48px 0 32px; text-align: center; }
        .article-title { font-size: 2.5rem; font-weight: 700; color: #e5e5e5; line-height: 1.2; margin-bottom: 16px; }
        .article-excerpt { font-size: 1.125rem; color: #a3a3a3; line-height: 1.6; }
        
        /* Legal Date */
        .legal-date { background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #3b82f6; }
        .legal-date-text { color: #a3a3a3; font-size: 0.875rem; font-style: italic; }
        
        /* Hero Ad */
        .ad-hero { margin: 48px 0; padding: 24px; background: #111111; border: 1px solid #262626; border-radius: 12px; text-align: center; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        
        /* Article Content */
        .article-content { background: #111111; border-radius: 16px; padding: 48px; margin: 48px 0; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); contain: layout; }
        .section-title { font-size: 1.75rem; font-weight: 600; color: #e5e5e5; margin-bottom: 24px; line-height: 1.3; }
        .section-body { font-size: 1.125rem; line-height: 1.7; color: #d1d5db; margin-bottom: 40px; }
        .section-body:last-child { margin-bottom: 0; }
        .section-body p { margin-bottom: 20px; }
        .section-body h1, .section-body h2, .section-body h3 { color: #e5e5e5; margin: 32px 0 16px; font-weight: 600; }
        .section-body h1 { font-size: 2rem; }
        .section-body h2 { font-size: 1.5rem; }
        .section-body h3 { font-size: 1.25rem; }
        .section-body ul, .section-body ol { margin: 16px 0; padding-left: 24px; }
        .section-body li { margin-bottom: 8px; }
        .section-body a { color: #60a5fa; text-decoration: none; }
        .section-body a:hover { text-decoration: underline; }
        
        /* Table of Contents */
        .toc-card { background: #1a1a1a; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px solid #262626; }
        .toc-title { font-size: 1.25rem; font-weight: 600; color: #e5e5e5; margin-bottom: 16px; }
        .toc-list { list-style: none; padding: 0; }
        .toc-item { margin-bottom: 8px; }
        .toc-link { color: #60a5fa; text-decoration: none; font-size: 0.875rem; }
        .toc-link:hover { text-decoration: underline; }
        
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
            .article-content { padding: 32px 24px; }
            .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
        }
        
        @media (max-width: 480px) {
            .article-title { font-size: 1.75rem; }
            .section-title { font-size: 1.5rem; }
            .footer-grid { grid-template-columns: 1fr; gap: 24px; }
            .stats-grid { grid-template-columns: 1fr; gap: 16px; }
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
                <a href="/categories" class="nav-link">Categories</a>
                <a href="/about" class="nav-link">About</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
        </div>
    </header>

    <div class="page-container">
        <div class="content-wrapper">
            <header class="article-header">
                <h1 class="article-title">Privacy Policy</h1>
                <p class="article-excerpt">
                    Learn how Search Termux collects, uses, and protects your personal information. Our commitment to your privacy and data security.
                </p>
            </header>

            <div class="legal-date">
                <p class="legal-date-text">Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div class="ad-hero">
              
            </div>

            <div class="toc-card">
                <h2 class="toc-title">Table of Contents</h2>
                <ul class="toc-list">
                    <li class="toc-item"><a href="#introduction" class="toc-link">1. Introduction</a></li>
                    <li class="toc-item"><a href="#information-we-collect" class="toc-link">2. Information We Collect</a></li>
                    <li class="toc-item"><a href="#how-we-use-information" class="toc-link">3. How We Use Your Information</a></li>
                    <li class="toc-item"><a href="#information-sharing" class="toc-link">4. Information Sharing</a></li>
                    <li class="toc-item"><a href="#data-security" class="toc-link">5. Data Security</a></li>
                    <li class="toc-item"><a href="#cookies" class="toc-link">6. Cookies and Tracking</a></li>
                    <li class="toc-item"><a href="#your-rights" class="toc-link">7. Your Rights</a></li>
                    <li class="toc-item"><a href="#contact-us" class="toc-link">8. Contact Us</a></li>
                </ul>
            </div>

            <main class="article-content">
                <section id="introduction">
                    <h2 class="section-title">1. Introduction</h2>
                    <div class="section-body">
                        <p>
                            Welcome to Search Termux ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our services.
                        </p>
                        <p>
                            By accessing or using our website, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                        </p>
                    </div>
                </section>

                <section id="information-we-collect">
                    <h2 class="section-title">2. Information We Collect</h2>
                    <div class="section-body">
                        <h3>Personal Information</h3>
                        <p>
                            We may collect personal information that you voluntarily provide to us when you:
                        </p>
                        <ul>
                            <li>Subscribe to our newsletter</li>
                            <li>Contact us through our contact form</li>
                            <li>Comment on our articles</li>
                            <li>Create an account on our platform</li>
                        </ul>

                        <h3>Automatically Collected Information</h3>
                        <p>
                            When you visit our website, we automatically collect certain information, including:
                        </p>
                        <ul>
                            <li>IP address and browser information</li>
                            <li>Pages visited and time spent on our site</li>
                            <li>Referring website information</li>
                            <li>Device and operating system information</li>
                        </ul>
                    </div>
                </section>

                <section id="how-we-use-information">
                    <h2 class="section-title">3. How We Use Your Information</h2>
                    <div class="section-body">
                        <p>
                            We use the information we collect for various purposes, including:
                        </p>
                        <ul>
                            <li>Providing and maintaining our services</li>
                            <li>Improving our website and user experience</li>
                            <li>Sending newsletters and updates (with your consent)</li>
                            <li>Responding to your comments and inquiries</li>
                            <li>Analyzing website usage and trends</li>
                            <li>Detecting and preventing fraud or abuse</li>
                        </ul>
                    </div>
                </section>
            </main>
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
                        <li><a href="/categories">Categories</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Categories</h3>
                    <ul>
                        <li><a href="/topics/lifestyle">Lifestyle</a></li>
                        <li><a href="/topics/travel">Travel & Adventure</a></li>
                        <li><a href="/topics/food">Food & Culture</a></li>
                        <li><a href="/topics/health">Health & Wellness</a></li>
                        <li><a href="/topics/entertainment">Entertainment</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Resources</h3>
                    <ul>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
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
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Privacy Policy - Search Termux","description":"Learn how Search Termux collects, uses, and protects your personal information.","url":"${process.env.R2_PUBLIC_URL}/privacy","publisher":{"@type":"Organization","name":"Search Termux","url":"${process.env.R2_PUBLIC_URL}"}}</script>
</body>
</html>`
}

/**
 * Render About Us Page
 */
export async function renderAboutPage(): Promise<string> {
  const pageData: StaticPageData = {
    title: 'About Us - Search Termux',
    description: 'Learn about Search Termux\'s mission to deliver diverse, high-quality content for readers and writers worldwide.',
    pageType: 'about'  }

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
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/about">
    
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
        .content-wrapper { max-width: 900px; margin: 0 auto; padding: 0 24px; }
        
        /* Article Header */
        .article-header { padding: 48px 0 32px; text-align: center; }
        .article-title { font-size: 2.5rem; font-weight: 700; color: #e5e5e5; line-height: 1.2; margin-bottom: 16px; }
        .article-excerpt { font-size: 1.125rem; color: #a3a3a3; line-height: 1.6; }
        
        /* Hero Ad */
        .ad-hero { margin: 48px 0; padding: 24px; background: #111111; border: 1px solid #262626; border-radius: 12px; text-align: center; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        
        /* Article Content */
        .article-content { background: #111111; border-radius: 16px; padding: 48px; margin: 48px 0; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); contain: layout; }
        .section-title { font-size: 1.75rem; font-weight: 600; color: #e5e5e5; margin-bottom: 24px; line-height: 1.3; }
        .section-body { font-size: 1.125rem; line-height: 1.7; color: #d1d5db; margin-bottom: 40px; }
        .section-body:last-child { margin-bottom: 0; }
        .section-body p { margin-bottom: 20px; }
        .section-body h1, .section-body h2, .section-body h3 { color: #e5e5e5; margin: 32px 0 16px; font-weight: 600; }
        .section-body h1 { font-size: 2rem; }
        .section-body h2 { font-size: 1.5rem; }
        .section-body h3 { font-size: 1.25rem; }
        .section-body ul, .section-body ol { margin: 16px 0; padding-left: 24px; }
        .section-body li { margin-bottom: 8px; }
        .section-body a { color: #60a5fa; text-decoration: none; }
        .section-body a:hover { text-decoration: underline; }
        
        /* Team Grid */
        .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; margin: 32px 0; }
        .team-member { background: #1a1a1a; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #262626; }
        .team-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #06b6d4); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 24px; }
        .team-name { font-size: 1.125rem; font-weight: 600; color: #e5e5e5; margin-bottom: 8px; }
        .team-role { color: #60a5fa; font-size: 0.875rem; margin-bottom: 12px; }
        .team-bio { color: #a3a3a3; font-size: 0.875rem; line-height: 1.5; }
        
        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin: 32px 0; }
        .stat-card { background: #1a1a1a; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #262626; }
        .stat-number { font-size: 2rem; font-weight: 700; color: #60a5fa; margin-bottom: 8px; }
        .stat-label { color: #a3a3a3; font-size: 0.875rem; }
        
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
            .article-content { padding: 32px 24px; }
            .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
            .team-grid { grid-template-columns: 1fr; gap: 24px; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        
        @media (max-width: 480px) {
            .article-title { font-size: 1.75rem; }
            .section-title { font-size: 1.5rem; }
            .footer-grid { grid-template-columns: 1fr; gap: 24px; }
            .stats-grid { grid-template-columns: 1fr; gap: 16px; }
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
                <a href="/categories" class="nav-link">Categories</a>
                <a href="/about" class="nav-link active">About</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
        </div>
    </header>

    <div class="page-container">
        <div class="content-wrapper">
            <header class="article-header">
                <h1 class="article-title">About Search Termux</h1>
                <p class="article-excerpt">
                    We're passionate about creating a platform that connects writers and readers from around the world. Our mission is to provide a space where diverse voices can be heard and stories can be shared.
                </p>
            </header>

            <div class="ad-hero">
              
            </div>

            <main class="article-content">
                <section>
                    <h2 class="section-title">Our Mission</h2>
                    <div class="section-body">
                        <p>
                            At Search Termux, we believe that everyone has a story to tell. Our mission is to create a platform where writers can share their experiences, insights, and knowledge with readers from all walks of life. We strive to foster a community where diverse voices are heard and celebrated.
                        </p>
                        <p>
                            We're committed to providing a space where writers can express themselves freely and readers can explore a wide range of topics. Our goal is to create a platform that is inclusive, engaging, and thought-provoking.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 class="section-title">Our Impact</h2>
                    <div class="section-body">
                        <p>
                            Since our founding, Search Termux has grown into a vibrant community of writers and readers. Here's how we're making a difference:
                        </p>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">1000+</div>
                                <div class="stat-label">Stories Published</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">50K+</div>
                                <div class="stat-label">Monthly Readers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">100+</div>
                                <div class="stat-label">Active Writers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">95%</div>
                                <div class="stat-label">Reader Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 class="section-title">Our Team</h2>
                    <div class="section-body">
                        <p>
                            Our diverse team of experienced writers and community managers brings together decades of combined experience in writing, editing, and community building.
                        </p>
                        
                        <div class="team-grid">
                            <div class="team-member">
                                <div class="team-avatar">A</div>
                                <div class="team-name">Alex Johnson</div>
                                <div class="team-role">Lead Writer</div>
                                <div class="team-bio">Full-time writer with a passion for storytelling and a background in journalism.</div>
                            </div>
                            <div class="team-member">
                                <div class="team-avatar">S</div>
                                <div class="team-name">Sarah Chen</div>
                                <div class="team-role">Community Manager</div>
                                <div class="team-bio">Experienced community manager with a background in digital marketing and social media.</div>
                            </div>
                            <div class="team-member">
                                <div class="team-avatar">M</div>
                                <div class="team-name">Mike Rodriguez</div>
                                <div class="team-role">Editor</div>
                                <div class="team-bio">Professional editor with a keen eye for detail and a background in literary criticism.</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
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
                        <li><a href="/categories">Categories</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Categories</h3>
                    <ul>
                        <li><a href="/topics/lifestyle">Lifestyle</a></li>
                        <li><a href="/topics/travel">Travel & Adventure</a></li>
                        <li><a href="/topics/food">Food & Culture</a></li>
                        <li><a href="/topics/health">Health & Wellness</a></li>
                        <li><a href="/topics/entertainment">Entertainment</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Resources</h3>
                    <ul>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
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
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"AboutPage","name":"About Search Termux","description":"Learn about Search Termux's mission to deliver diverse, high-quality content for readers and writers worldwide.","url":"${process.env.R2_PUBLIC_URL}/about","publisher":{"@type":"Organization","name":"Search Termux","url":"${process.env.R2_PUBLIC_URL}"}}</script>
</body>
</html>`
}

/**
 * Render Terms of Use page with comprehensive legal sections
 */
export async function renderTermsPage(): Promise<string> {
  const pageData: StaticPageData = {
    title: 'Terms of Use - Search Termux',
    description: 'Terms of Use for Search Termux. Learn about our terms of service, user responsibilities, and legal information.',
    pageType: 'terms'
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
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/terms">
    
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
        .content-wrapper { max-width: 900px; margin: 0 auto; padding: 0 24px; }
        
        /* Article Header */
        .article-header { padding: 48px 0 32px; text-align: center; }
        .article-title { font-size: 2.5rem; font-weight: 700; color: #e5e5e5; line-height: 1.2; margin-bottom: 16px; }
        .article-excerpt { font-size: 1.125rem; color: #a3a3a3; line-height: 1.6; }
        
        /* Article Content */
        .article-content { background: #111111; border-radius: 16px; padding: 48px; margin: 48px 0; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); contain: layout; }
        .section-title { font-size: 1.75rem; font-weight: 600; color: #e5e5e5; margin-bottom: 24px; line-height: 1.3; }
        .section-body { font-size: 1.125rem; line-height: 1.7; color: #d1d5db; margin-bottom: 40px; }
        .section-body:last-child { margin-bottom: 0; }
        .section-body p { margin-bottom: 20px; }
        .section-body h3 { font-size: 1.25rem; font-weight: 600; color: #e5e5e5; margin: 32px 0 16px; }
        .section-body h4 { font-size: 1.125rem; font-weight: 600; color: #e5e5e5; margin: 24px 0 12px; }
        .section-body ul, .section-body ol { margin: 16px 0; padding-left: 24px; }
        .section-body li { margin-bottom: 8px; }
        .section-body strong { color: #e5e5e5; font-weight: 600; }
        
        /* Table of Contents */
        .toc { background: #1a1a1a; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px solid #262626; }
        .toc h3 { color: #e5e5e5; margin-bottom: 16px; font-size: 1.25rem; }
        .toc ul { list-style: none; padding: 0; }
        .toc li { margin: 8px 0; }
        .toc a { color: #60a5fa; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .toc a:hover { color: #93c5fd; }
        
        /* Inline Ad */
        .ad-inline { margin: 64px 0; padding: 24px; background: #0f0f0f; border: 1px solid #262626; border-radius: 12px; text-align: center; min-height: 120px; display: flex; align-items: center; justify-content: center; }
        
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
            .article-content { padding: 32px 24px; }
            .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
        }
        
        @media (max-width: 480px) {
            .article-title { font-size: 1.75rem; }
            .section-title { font-size: 1.5rem; }
            .footer-grid { grid-template-columns: 1fr; gap: 24px; }
            .stats-grid { grid-template-columns: 1fr; gap: 16px; }
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
                <a href="/categories" class="nav-link">Categories</a>
                <a href="/about" class="nav-link">About</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
        </div>
    </header>

    <div class="page-container">
        <div class="content-wrapper">
            <header class="article-header">
                <h1 class="article-title">Terms of Use</h1>
                <p class="article-excerpt">
                    Please read these Terms of Use carefully before using our website and services.
                </p>
            </header>

            <div class="ad-inline">
              
            </div>

            <main class="article-content">
                <div class="toc">
                    <h3>Table of Contents</h3>
                    <ul>
                        <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                        <li><a href="#description">2. Description of Service</a></li>
                        <li><a href="#user-accounts">3. User Accounts</a></li>
                        <li><a href="#acceptable-use">4. Acceptable Use Policy</a></li>
                        <li><a href="#content">5. Content and Intellectual Property</a></li>
                        <li><a href="#privacy">6. Privacy and Data Protection</a></li>
                        <li><a href="#disclaimers">7. Disclaimers and Warranties</a></li>
                        <li><a href="#limitation">8. Limitation of Liability</a></li>
                        <li><a href="#termination">9. Termination</a></li>
                        <li><a href="#governing-law">10. Governing Law</a></li>
                        <li><a href="#changes">11. Changes to Terms</a></li>
                        <li><a href="#contact">12. Contact Information</a></li>
                    </ul>
                </div>

                <section id="acceptance">
                    <h2 class="section-title">1. Acceptance of Terms</h2>
                    <div class="section-body">
                        <p>By accessing and using Search Termux ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                        <p><strong>Effective Date:</strong> These Terms of Use are effective as of ${new Date().toLocaleDateString()}.</p>
                        <p><strong>Age Requirement:</strong> You must be at least 13 years old to use our services. If you are under 18, you must have your parent or guardian's permission to use our services.</p>
                    </div>
                </section>

                <section id="description">
                    <h2 class="section-title">2. Description of Service</h2>
                    <div class="section-body">
                        <p>Search Termux is a community-driven content platform that provides:</p>
                        <ul>
                            <li>High-quality articles about diverse topics including lifestyle, travel, food, culture, and more</li>
                            <li>A platform for writers to share their stories and insights</li>
                            <li>Tools for content creation and community engagement</li>
                            <li>Search functionality to discover content</li>
                            <li>Community features for readers and writers</li>
                        </ul>
                    </div>
                </section>

        

                <section id="user-accounts">
                    <h2 class="section-title">3. User Accounts</h2>
                    <div class="section-body">
                        <h3>Account Creation</h3>
                        <p>Some features of our service may require you to create an account. When creating an account, you must:</p>
                        <ul>
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Maintain the security of your password and account</li>
                            <li>Accept responsibility for all activities that occur under your account</li>
                        </ul>
                        
                        <h3>Account Security</h3>
                        <p>You are responsible for safeguarding the password and all activities that happen under your account. You must immediately notify us of any unauthorized use of your account.</p>
                    </div>
                </section>

                <section id="acceptable-use">
                    <h2 class="section-title">4. Acceptable Use Policy</h2>
                    <div class="section-body">
                        <p>You agree not to use our service to:</p>
                        <ul>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Transmit harmful, offensive, or inappropriate content</li>
                            <li>Infringe upon intellectual property rights</li>
                            <li>Engage in spamming or unsolicited advertising</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt our service or servers</li>
                            <li>Use automated tools to access our service without permission</li>
                        </ul>
                        <p><strong>Consequences:</strong> Violation of this policy may result in account suspension or termination.</p>
                    </div>
                </section>

                <section id="content">
                    <h2 class="section-title">5. Content and Intellectual Property</h2>
                    <div class="section-body">
                        <h3>Our Content</h3>
                        <p>All content on Search Termux, including but not limited to text, graphics, images, logos, and software, is owned by us or our licensors and is protected by copyright and other intellectual property laws.</p>
                        
                        <h3>Your Content</h3>
                        <p>When you submit content to our platform, you retain ownership but grant us a worldwide, non-exclusive, royalty-free license to use, modify, and distribute your content in connection with our service.</p>
                        
                        <h3>Copyright Policy</h3>
                        <p>We respect intellectual property rights and comply with the Digital Millennium Copyright Act (DMCA). If you believe your copyright has been infringed, please contact us with detailed information.</p>
                    </div>
                </section>

                <section id="privacy">
                    <h2 class="section-title">6. Privacy and Data Protection</h2>
                    <div class="section-body">
                        <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
                        <p>By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.</p>
                        <p><strong>Data Security:</strong> We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    </div>
                </section>

                <section id="disclaimers">
                    <h2 class="section-title">7. Disclaimers and Warranties</h2>
                    <div class="section-body">
                        <p>Our service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties or representations about:</p>
                        <ul>
                            <li>The accuracy, reliability, or completeness of our content</li>
                            <li>The uninterrupted or error-free operation of our service</li>
                            <li>The security of data transmission over the internet</li>
                            <li>The merchantability or fitness for a particular purpose</li>
                        </ul>
                        <p><strong>Educational Purpose:</strong> Our content is for educational and informational purposes only and should not be considered professional advice.</p>
                    </div>
                </section>

                <section id="limitation">
                    <h2 class="section-title">8. Limitation of Liability</h2>
                    <div class="section-body">
                        <p>To the maximum extent permitted by law, Search Termux shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
                        <ul>
                            <li>Loss of profits or revenue</li>
                            <li>Loss of data or information</li>
                            <li>Business interruption</li>
                            <li>Personal injury or property damage</li>
                        </ul>
                        <p><strong>Maximum Liability:</strong> Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>
                    </div>
                </section>

                <section id="termination">
                    <h2 class="section-title">9. Termination</h2>
                    <div class="section-body">
                        <h3>By You</h3>
                        <p>You may terminate your account at any time by contacting us or using the account deletion feature if available.</p>
                        
                        <h3>By Us</h3>
                        <p>We may terminate or suspend your account immediately, without prior notice, for any reason, including violation of these Terms of Use.</p>
                        
                        <h3>Effect of Termination</h3>
                        <p>Upon termination, your right to use our service will cease immediately. Provisions that should survive termination will remain in effect.</p>
                    </div>
                </section>

                <section id="governing-law">
                    <h2 class="section-title">10. Governing Law</h2>
                    <div class="section-body">
                        <p>These Terms of Use shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.</p>
                        <p><strong>Dispute Resolution:</strong> Any disputes arising from these terms will be resolved through binding arbitration in accordance with the rules of [Arbitration Organization].</p>
                    </div>
                </section>

                <section id="changes">
                    <h2 class="section-title">11. Changes to Terms</h2>
                    <div class="section-body">
                        <p>We reserve the right to modify these Terms of Use at any time. We will notify users of significant changes by:</p>
                        <ul>
                            <li>Posting a notice on our website</li>
                            <li>Sending an email notification to registered users</li>
                            <li>Updating the effective date of these terms</li>
                        </ul>
                        <p>Your continued use of our service after changes constitutes acceptance of the new terms.</p>
                    </div>
                </section>

                <section id="contact">
                    <h2 class="section-title">12. Contact Information</h2>
                    <div class="section-body">
                        <p>If you have any questions about these Terms of Use, please contact us:</p>
                        <ul>
                            <li><strong>Email:</strong> legal@searchtermux.com</li>
                            <li><strong>Address:</strong> [Your Business Address]</li>
                            <li><strong>Phone:</strong> [Your Phone Number]</li>
                        </ul>
                        <p><strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours during business days.</p>
                    </div>
                </section>
            </main>
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
                        <li><a href="/categories">Categories</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h3>Categories</h3>
                    <ul>
                        <li><a href="/topics/lifestyle">Lifestyle</a></li>
                        <li><a href="/topics/travel">Travel & Adventure</a></li>
                        <li><a href="/topics/food">Food & Culture</a></li>
                        <li><a href="/topics/health">Health & Wellness</a></li>
                        <li><a href="/topics/entertainment">Entertainment</a></li>
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
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Terms of Use - Search Termux","description":"Terms of Use for Search Termux. Learn about our terms of service, user responsibilities, and legal information.","url":"${process.env.R2_PUBLIC_URL}/terms","isPartOf":{"@type":"WebSite","name":"Search Termux","url":"${process.env.R2_PUBLIC_URL}/"},"publisher":{"@type":"Organization","name":"Search Termux"}}</script>
</body>
</html>`
}

/**
 * Render Articles listing page with featured content and categories
 */
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

/**
 * Render Search Page with professional design
 */
export async function renderSearchPage(): Promise<string> {
  const pageData: StaticPageData = {
    title: 'Search - Search Termux',
    description: 'Search our comprehensive library of diverse articles, stories, and insights from our community of writers.',
    pageType: 'search'
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

    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16540992045"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-16540992045');
    </script>
    
    <!-- AdSense for Search -->
    <script async="async" src="https://www.google.com/adsense/search/ads.js"></script>
    <script type="text/javascript" charset="utf-8">
    (function(g,o){g[o]=g[o]||function(){(g[o]['q']=g[o]['q']||[]).push(
      arguments)},g[o]['t']=1*new Date})(window,'_googCsa');
    </script>
    
    <!-- Fonts -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>
    

    <!-- SEO Meta -->
    <title>${escapeHtml(pageData.title)}</title>
    <meta name="description" content="${escapeHtml(pageData.description)}">
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="search, blog articles, stories, lifestyle, travel, food, culture, entertainment, writing, community">
    
    <!-- Social Meta -->
    <meta property="og:title" content="${escapeHtml(pageData.title)}">
    <meta property="og:description" content="${escapeHtml(pageData.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${process.env.R2_PUBLIC_URL}/search">
    <meta property="og:image" content="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(pageData.title)}">
    <meta name="twitter:description" content="${escapeHtml(pageData.description)}">
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop">

    <style>
        /* Reset & Base */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
        body { background: #0a0a0a; color: #e5e5e5; line-height: 1.6; min-height: 100vh; display: flex; flex-direction: column; }
        
        /* Header with Search */
        .header { background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #262626; position: sticky; top: 0; z-index: 50; }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 12px 16px; }
        
        /* Logo */
        .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #e5e5e5; font-weight: 600; }
        .logo-icon { width: 24px; height: 24px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 12px; }
        
        /* Search Form */
        .search-form { display: flex; gap: 6px; flex: 1; max-width: 600px; }
        .search-input { 
            flex: 1; 
            padding: 8px 12px; 
            background: #1a1a1a; 
            border: 1px solid #374151; 
            border-radius: 4px; 
            color: #e5e5e5; 
            font-size: 14px; 
            outline: none; 
            transition: border-color 0.2s;
            min-width: 0;
        }
        .search-input:focus { border-color: #3b82f6; }
        .search-input::placeholder { color: #6b7280; }
        .search-btn { 
            padding: 8px 16px; 
            background: #3b82f6; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            font-size: 14px; 
            font-weight: 500; 
            cursor: pointer; 
            transition: background-color 0.2s;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .search-btn:hover { background: #2563eb; }
        .search-btn:disabled { background: #374151; cursor: not-allowed; opacity: 0.7; }
        
        /* Main Content */
        .main { flex: 1; max-width: 1200px; margin: 0 auto; padding: 16px; width: 100%; }
        
        /* Google Ads - Maximum Space */
        .ads-section { margin-bottom: 24px; }
        .ad-container { 
            background: #111111; 
            border: 1px solid #262626; 
            border-radius: 6px; 
            padding: 16px; 
            text-align: center; 
            min-height: 350px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
        }
        .ad-placeholder { color: #6b7280; font-size: 14px; }
        
        /* Search Results */
        .results-section { margin-bottom: 32px; }
        .results-info { margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #262626; color: #6b7280; font-size: 13px; }
        
        /* States */
        .state { display: none; text-align: center; padding: 32px 16px; }
        .state.active { display: block; }
        .loading-spinner { width: 20px; height: 20px; border: 2px solid #262626; border-top: 2px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 8px; }
        .error-icon { width: 32px; height: 32px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; color: white; font-size: 16px; }
        .empty-icon { width: 32px; height: 32px; background: #262626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; color: #6b7280; font-size: 16px; }
        
        /* Result Items */
        .result { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #1a1a1a; }
        .result:last-child { border-bottom: none; margin-bottom: 0; }
        .result-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; line-height: 1.3; }
        .result-title a { color: #3b82f6; text-decoration: none; }
        .result-title a:hover { text-decoration: underline; }
        .result-url { font-size: 12px; color: #10b981; margin-bottom: 4px; }
        .result-description { font-size: 13px; color: #a3a3a3; line-height: 1.4; }
        
        /* Footer */
        .footer { background: #111111; border-top: 1px solid #262626; margin-top: auto; }
        .footer-content { max-width: 1200px; margin: 0 auto; padding: 12px 16px; text-align: center; }
        .footer-links { display: flex; justify-content: center; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
        .footer-links a { color: #a3a3a3; text-decoration: none; font-size: 12px; transition: color 0.2s; }
        .footer-links a:hover { color: #e5e5e5; }
        .footer-text { color: #6b7280; font-size: 11px; }
        
        /* Mobile Layout - Logo Centered */
        @media (max-width: 768px) {
            .header-content { 
                display: flex; 
                flex-direction: column; 
                gap: 12px; 
                align-items: center; 
                text-align: center; 
            }
            .search-form { 
                width: 100%; 
                max-width: 400px; 
            }
            .ad-container { 
                min-height: 300px; 
                padding: 12px; 
            }
            .main { padding: 12px; }
            .footer-content { padding: 8px 16px; }
            .footer-links { gap: 8px; }
            .footer-links a { font-size: 11px; }
            .footer-text { font-size: 10px; }
        }
        
        /* Desktop Layout - Logo and Search Side by Side */
        @media (min-width: 769px) {
            .header-content { 
                display: flex; 
                align-items: center; 
                gap: 24px; 
            }
            .search-form { 
                margin-left: auto; 
            }
            .ad-container { 
                min-height: 400px; 
            }
        }
        
        /* Large Desktop - Even More Space for Ads */
        @media (min-width: 1200px) {
            .ad-container { 
                min-height: 450px; 
            }
        }
        
        /* Animations */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .result { animation: fadeIn 0.3s ease-out; }
    </style>
</head>

<body>
    <!-- Header with Logo and Search -->
    <header class="header">
        <div class="header-content">
            <div class="logo">
                <div class="logo-icon">S</div>
                <span>Search Termux</span>
            </div>
            <form class="search-form" id="searchForm">
                <input 
                    type="text" 
                    class="search-input" 
                    id="searchInput"
                    placeholder="Search articles, tutorials..."
                    autocomplete="off"
                >
                <button type="submit" class="search-btn" id="searchBtn">Search</button>
            </form>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main">
        <!-- Google Ads Section - Maximum Space -->
        <section class="ads-section">
            <!-- Google AFS Ads -->
            <div id="afsresults"></div>
        </section>
        
        <!-- Search Results -->
        <section class="results-section">
            <!-- Loading State -->
            <div class="state" id="loadingState">
                <div class="loading-spinner"></div>
                <div>Searching...</div>
            </div>
            
            <!-- Error State -->
            <div class="state" id="errorState">
                <div class="error-icon">!</div>
                <div style="color: #dc2626; font-weight: 500; margin-bottom: 4px;">Search Error</div>
                <div class="error-message">Please try again</div>
            </div>
            
            <!-- Empty State -->
            <div class="state" id="emptyState">
                <div class="empty-icon">🔍</div>
                <div style="font-weight: 500; margin-bottom: 4px;">No results found</div>
                <div style="color: #6b7280;">Try different keywords</div>
            </div>
            
            <!-- Results -->
            <div id="resultsContainer" style="display: none;">
                <div class="results-info" id="resultsInfo"></div>
                <div id="resultsList"></div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
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

    <script>
        // Configuration
        const SEARCH_API_URL = 'https://searchtermux-search-worker-dev.tech-a14.workers.dev';
        
        // DOM Elements
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsInfo = document.getElementById('resultsInfo');
        const resultsList = document.getElementById('resultsList');
        
        // State
        let isSearching = false;
        
        // Initialize
        function init() {
            const urlParams = new URLSearchParams(window.location.search);
            const initialQuery = urlParams.get('q') || '';
            
            if (initialQuery) {
                searchInput.value = initialQuery;
                performSearch(initialQuery);
            }
            
            searchForm.addEventListener('submit', handleSubmit);
            searchInput.focus();
        }
        
        // Handle form submission
        function handleSubmit(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            
            if (query.length < 2) {
                showError('Please enter at least 2 characters');
                return;
            }
            
            // Update URL
            const newUrl = window.location.pathname + '?q=' + encodeURIComponent(query);
            window.history.pushState({}, '', newUrl);
            
            performSearch(query);
        }
        
        // Perform search
        async function performSearch(query) {
            if (isSearching) return;
            
            isSearching = true;
            showLoading();
            
            try {
                const response = await fetch(SEARCH_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: query,
                        options: { limit: 10 }
                    })
                });
                
                if (!response.ok) throw new Error('Search failed');
                
                const data = await response.json();
                displayResults(data);
                
            } catch (error) {
                console.error('Search error:', error);
                showError('Search temporarily unavailable');
            } finally {
                isSearching = false;
                searchBtn.disabled = false;
                searchBtn.textContent = 'Search';
            }
        }
        
        // Display results
        function displayResults(data) {
            hideAllStates();
            
            const results = data.results || [];
            const total = data.totalResults || results.length;
            const time = data.processingTime || '';
            
            if (results.length === 0) {
                emptyState.classList.add('active');
                return;
            }
            
            resultsInfo.textContent = \`About \${total.toLocaleString()} results\${time ? \` (\${time})\` : ''}\`;
            
            resultsList.innerHTML = results.map((result, index) => \`
                <div class="result" style="animation-delay: \${index * 30}ms">
                    <div class="result-title">
                        <a href="\${escapeHtml(result.url)}" target="_blank" rel="noopener">
                            \${escapeHtml(result.title || 'Untitled')}
                        </a>
                    </div>
                    <div class="result-url">\${escapeHtml(getDomain(result.url))}</div>
                    <div class="result-description">\${escapeHtml(result.snippet || result.description || '')}</div>
                </div>
            \`).join('');
            
            resultsContainer.style.display = 'block';
        }
        
        // Utility functions
        function showLoading() {
            hideAllStates();
            loadingState.classList.add('active');
            searchBtn.disabled = true;
            searchBtn.textContent = 'Searching...';
        }
        
        function showError(message) {
            hideAllStates();
            errorState.classList.add('active');
            errorState.querySelector('.error-message').textContent = message;
        }
        
        function hideAllStates() {
            [loadingState, errorState, emptyState].forEach(el => el.classList.remove('active'));
            resultsContainer.style.display = 'none';
        }
        
        function getDomain(url) {
            try {
                return new URL(url).hostname;
            } catch {
                return url;
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', init);
        
  
    </script>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16540992045"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-16540992045');
    </script>
    
    <!-- Google AFS Ads -->
<script async src="https://www.google.com/adsense/search/ads.js"></script>
<script>
(function(g,o){g[o]=g[o]||function(){(g[o]['q']=g[o]['q']||[]).push(arguments)};
g[o]['t']=1*new Date})(window,'_googCsa');
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('q') || '';
const channel_id = urlParams.get('channel_id') || '';
const style_id = urlParams.get('style_id') || '';
const clickid = urlParams.get('clickid') || '';
var pageOptions = {
pubId: 'partner-pub-6567805284657549',
query: searchTerm,
styleId: style_id,
channel: channel_id,
adPage: 1,
adsafe: "low",
};
var adblock = {
container: 'afsresults',
width: '100%',
number: 4
};
_googCsa('ads', pageOptions, adblock);
</script>
<!-- :zap: Tracking: ClickFlare + Google Ads + Mediago -->
	<script>
(function() {
  /** ------------------------
   * Utility functions
   * ------------------------ */

  function sendBeacon(url) {
    console.log("[Beacon] Sending to:", url);
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon(url);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.send();
    }
  }

  function readCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function readQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /** ------------------------
   * Load Google Tag (gtag.js)
   * ------------------------ */
  (function ensureGtag() {
    if (window.gtag && window.dataLayer) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=AW-16540992045';
    document.head.appendChild(s);

    gtag('js', new Date());
    gtag('config', 'AW-16540992045');
  })();

  /** ------------------------
   * Google Conversion Event
   * ------------------------ */
  function fireGoogleConversion(opts) {
    if (typeof gtag !== 'function') {
      console.warn("[GTAG] Not ready yet. Retrying...");
      setTimeout(() => fireGoogleConversion(opts), 800);
      return;
    }

    const value = typeof opts?.value === 'number' ? opts.value : 0.05;
    const currency = opts?.currency || 'USD';
    const transaction_id = opts?.transaction_id;

    console.log("[GTAG] Firing conversion:", {
      value,
      currency,
      transaction_id
    });

    gtag('event', 'conversion', {
      send_to: 'AW-16540992045/w3DlCI2a_9MaEK2Ers89',
      value: value,
      currency: currency,
      transaction_id: transaction_id
    });
  }

  /** ------------------------
   * Mediago Pixel Event
   * ------------------------ */
  function fireMediagoPixel() {
    console.log("[Mediago] Firing pixel");
    window._megoaa = window._megoaa || [];
    window._megoaa.push({
      type: 'event',
      name: 'Final_Click',
      acid: '32328',
      pxd: '1447150488659505'
    });

    const img = new Image();
    img.src = '//trace.mediago.io/api/bidder/track/pixel/conversion?cvn=Final_convrsion&acid=32328&pxd=1447150488659505&tn=f9f2b1ef23fe2759c2cad0953029a94b';
    img.style.display = 'none';
    document.body.appendChild(img);
  }

  /** ------------------------
   * Helper to wait for GTAG
   * ------------------------ */
  function waitForGtag(callback, retries = 8) {
    if (typeof gtag === 'function' && window.dataLayer) return callback();
    if (retries > 0) setTimeout(() => waitForGtag(callback, retries - 1), 500);
    else console.warn("[GTAG] Timeout waiting for gtag.js");
  }

  /** ------------------------
   * Main Listener
   * ------------------------ */
  window.addEventListener("message", (event) => {
    console.log("[Message] Received from:", event.origin, event.data);

    const elem = document.activeElement;
    const isFromSyndicated = event.origin.startsWith("https://syndicatedsearch.goog");

    if (elem && elem.tagName === "IFRAME" && isFromSyndicated) {
      console.log("[Trigger] Syndicated search iframe detected");

      if (sessionStorage.getItem("conversionFired")) {
        console.log("[Skip] Conversion already fired in this session");
        return;
      }
      sessionStorage.setItem("conversionFired", "1");

      const click_id   = readQueryParam('clickid') || readCookie("cf_click_id") || '';
      const keyword    = readQueryParam("s") || '';
      const channel_id = readQueryParam("channel_id") || '';
      const style_id   = readQueryParam("style_id") || '';
      const domain_name = readQueryParam("domain_name") || '';
      const tracking_domain = "knnpostbacks.com";

      const cv_pixel_url = new URL('https://' + tracking_domain + '/cf/cv');
      cv_pixel_url.searchParams.set('click_id', click_id);
      cv_pixel_url.searchParams.set('param1', keyword);
      cv_pixel_url.searchParams.set('param10', channel_id);
      cv_pixel_url.searchParams.set('param11', style_id);
      cv_pixel_url.searchParams.set('ct', 'search_click');
      if (domain_name) cv_pixel_url.searchParams.set('param12', domain_name);

      sendBeacon(cv_pixel_url.toString());

      const cv  = parseFloat(readQueryParam('cv'));
      const ccy = readQueryParam('ccy');

      waitForGtag(() => {
        fireGoogleConversion({
          value: isNaN(cv) ? undefined : cv,
          currency: ccy || undefined,
          transaction_id: click_id
        });
      });

      fireMediagoPixel();
    } else {
      // Optional: log messages that don't match
      console.log("[Message ignored] Not from expected iframe/origin.");
    }
  });
})();
</script>







    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": "${process.env.R2_PUBLIC_URL}/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
    }
    </script>
</body>
</html>`
}

/**
 * Render individual static article page
 */
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
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
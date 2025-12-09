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
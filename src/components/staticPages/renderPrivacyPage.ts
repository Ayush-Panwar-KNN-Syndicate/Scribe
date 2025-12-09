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
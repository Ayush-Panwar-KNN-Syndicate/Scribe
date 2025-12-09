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
    // <script>
    

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

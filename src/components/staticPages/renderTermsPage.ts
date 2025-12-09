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
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
        <!-- Google Ads Section - Maximum Space test-->


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
linkTarget: _blank,	
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
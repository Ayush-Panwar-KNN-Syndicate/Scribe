import { ArticleForRender, ArticleSection } from '@/types/database'
import { generateResponsiveImage } from './cloudflare-images'
import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
})

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function markdownToHtml(markdown: string): string {
  try {
    // Check if content is already HTML (contains HTML tags)
    const hasHtmlTags = /<[^>]+>/.test(markdown)

    if (hasHtmlTags) {
      // Already HTML, return as-is
      return markdown
    }

    // Convert markdown to HTML
    const html = marked.parse(markdown, { async: false }) as string
    return html
  } catch (error) {
    console.error('Markdown conversion error:', error)
    return markdown
  }
}

function sectionsToHtml(sections: ArticleSection[], imageId?: string | null): string {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)
  
  let html = ''
  
  sortedSections.forEach((section, index) => {
    const headerText = String(section.header || '').trim()
    const isConclusion = /^\s*(conclusion|summary)\b/i.test(headerText)
    const isReferences = /^\s*(references?|sources?|bibliography)\b/i.test(headerText)
    const headerHtml = escapeHtml(section.header)

    // Convert markdown to HTML if needed
    let contentHtml = markdownToHtml(section.content)

    // In conclusion/summary, remove any inner subheadings to keep it clean
    if (isConclusion) {
      // Strip any inner headings entirely
      contentHtml = contentHtml.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, '')
      // Remove leading "Conclusion:" or "Summary:" prefixes if present inside the first paragraph
      contentHtml = contentHtml
        // Inside a paragraph with optional bold/strong wrappers
        .replace(/<p([^>]*)>\s*(?:<(?:strong|b)[^>]*>)?\s*(?:conclusion|summary)\s*[:\-–—]?\s*(?:<\/(?:strong|b)>)?/i, '<p$1>')
        // Or at the very start of raw HTML (no paragraph wrap yet)
        .replace(/^\s*(?:<(?:strong|b)[^>]*>)?\s*(?:conclusion|summary)\s*[:\-–—]?\s*(?:<\/(?:strong|b)>)?/i, '')
    }

    // For References section, ensure proper formatting
    if (isReferences) {
      // Remove any "References:" or "Sources:" prefix from the content
      contentHtml = contentHtml
        .replace(/^<p>\s*(?:<(?:strong|b)[^>]*>)?\s*(?:references?|sources?)\s*[:\-–—]?\s*(?:<\/(?:strong|b)>)?\s*<\/p>/i, '')
        .replace(/^\s*(?:<(?:strong|b)[^>]*>)?\s*(?:references?|sources?)\s*[:\-–—]?\s*(?:<\/(?:strong|b)>)?/i, '')

      // Extract all links and limit to 2-3
      const linkMatches = contentHtml.match(/<a\s+[^>]*href=["'][^"']+["'][^>]*>.*?<\/a>/gi)
      if (linkMatches && linkMatches.length > 0) {
        // Limit to max 3 references
        const limitedLinks = linkMatches.slice(0, 3)
        contentHtml = '<ul>\n' + limitedLinks.map(link => `<li>${link}</li>`).join('\n') + '\n</ul>'
      } else {
        // If no links found, keep only the <ul> if it exists
        const ulMatch = contentHtml.match(/(<ul>[\s\S]*?<\/ul>)/i)
        if (ulMatch) {
          contentHtml = ulMatch[1]
        }
      }
    }

    const sectionClass = isConclusion ? ' is-conclusion' : (isReferences ? ' is-references' : '')

    html += `
      <section class="content-section${sectionClass}">
        <h2 class="section-title">${headerHtml}</h2>
        <div class="section-body">
          ${contentHtml}
        </div>
      </section>
    `
    
    // Article image insertion after first section
    if (index === 0 && imageId) {
      html += `
        <!-- Article Image (Cloudflare Images) -->
        <figure class="article-image-container">
          ${generateResponsiveImage(imageId, 'Article illustration')}
        </figure>
      `
    }
    
    // Related Search 2 - After the first section
    if (index === 0 && sortedSections.length > 0) {
      html += `
        <!-- Related Search 2 - After First Section -->
        <div id="relatedsearches2"></div>
      `
    }
  })
  
  return html
}

function toISOString(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toISOString()
}

export async function renderStructuredArticleHtml(article: ArticleForRender): Promise<string> {
  const sectionsHtml = sectionsToHtml(article.sections, article.image_id)
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
    <link rel="preconnect" href="https://imagedelivery.net">
    
    <!-- Google tag (gtag.js)  add script here--> 
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16540992045"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-16540992045');
    </script>
    

      
    <!-- offer tracking script -->
  <script>
!function() {
  "use strict";
  var n = "lp_ref",
      t = "cpid",
      e = "lpurl",
      c = "https://knnpostbacks.com",
      r = "(http(?:s?)://[^/]*)/cf/click",
      a = "(?:(?:/([1-9][0-9]*)/?)|(?:/))?",
      i = "^" + r + a + "(?:$|\\?.*)",
      o = 'javascript:window.clickflare.l="(' + r + a + '(\\"|(\\?[^"]*\\"))).*',
      s = function() { return new RegExp(i, ""); },
      u = function() { return new RegExp(o, ""); };

  function l(n) {
    var t = function(n) {
      return n.replace(s(), function(n) {
        var t = Array.prototype.slice.call(arguments, 1),
            r = t[t.length - 1]; // domain is group 1 now
        return n.replace(r, c);
      });
    }(n);
    return 'javascript:window.clickflare.l="' + t + '"; void 0;';
  }

  function f(n, t) {
    if (t && n && t.apply(document, [n]),
        /loaded|interactive|complete/.test(document.readyState)) {
      for (var e = 0, c = document.links.length; e < c; e++) {
        if (s().test(document.links[e].href)) {
          var r = document.links[e];
          window.clickflare.links_replaced.has(r) ||
            (r.href = l(r.href), window.clickflare.links_replaced.add(r));
        }
      }
    }
  }

  var d, h, m, p;
  !function(r, a) {
    var i = document.onreadystatechange;
    window.clickflare || (window.clickflare = {
      listeners: {},
      customParams: {},
      links_replaced: new Set,
      addEventListener: function(n, t) {
        var e = this.listeners[n] || [];
        e.includes(t) || e.push(t),
        this.listeners[n] = e;
      },
      dispatchEvent: function(n, t) {
        t && (this.customParams[n] = t),
        (this.listeners[n] || []).forEach(function(n) { return n(t); });
      },
      push: function(n, t) {
        t && (this.customParams[n] = t),
        (this.listeners[n] || []).forEach(function(n) { return n(t); });
      }
    }),
    document.onreadystatechange = function(n) { return f(n, i); },
    f(null, i),
    setTimeout(function() {
      !function(r, a) {
        var i,
            o = function(r, a) {
              var i = new URL("" + c + r),
                  o = "{",
                  s = o + o;
              a.startsWith(s) || i.searchParams.set(t, a);
              i.searchParams.append(n, document.referrer),
              i.searchParams.append(e, location.href),
              i.searchParams.append("lpt", document.title),
              i.searchParams.append("t", (new Date).getTime().toString());
              return i.toString();
            }(r, a),
            s = document.createElement("script"),
            l = document.scripts[0];
        s.async = 1,
        s.src = o,
        s.onerror = function() {
          !function() {
            for (var n = function(n, t) {
              var e = document.links[n];
              u().test(e.href) && setTimeout(function() {
                e && e.setAttribute("href", function(n) {
                  var t = n.match(u());
                  if (t) {
                    var e = t[1]; // original_link group
                    return e ? e.slice(0, -1) : n;
                  }
                  return n;
                }(e.href));
              });
            }, t = 0, e = document.links.length; t < e; t++) n(t);
          }();
        },
        null === (i = l.parentNode) || void 0 === i || i.insertBefore(s, l);
      }(r, a);
    });
  }(""
    + "/cf/tags" + "/"
    + (new URL(window.location.href).searchParams.get("cftmid") || "{{__CONTAINER_ID__}}"),
    (m = new URL(window.location.href).searchParams.get(t),
     d = new RegExp("(^| )" + "cf_cpid" + "=([^;]+)"),
     p = (h = document.cookie.match(d)) && h.pop() || null,
     m || p || "{{__CAMPAIGN_ID__}}"))
}();
</script>


    <!-- AdSense -->
    <script async="async" src="https://www.google.com/adsense/search/ads.js"></script>
    <script type="text/javascript" charset="utf-8">
    (function(g,o){g[o]=g[o]||function(){(g[o]['q']=g[o]['q']||[]).push(
      arguments)},g[o]['t']=1*new Date})(window,'_googCsa');
    </script>
    
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
        .article-excerpt { font-size: 0.875rem; color: #a3a3a3; line-height: 1.3; text-align: justify; }
        
        /* Compact Article Content - Minimal Space */
        .article-content { background: #111111; border-radius: 8px; padding: 16px 12px; margin: 12px 0; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3); }
        .section-title { font-size: 1.125rem; font-weight: 600; color: #e5e5e5; margin-bottom: 8px; line-height: 1.2; }
        .section-body { font-size: 0.875rem; line-height: 1.5; color: #d1d5db; margin-bottom: 12px; }
        .content-section { margin-bottom: 18px; }
        .content-section + .content-section { margin-top: 18px; }
        .content-section.is-conclusion { margin-top: 24px; }
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

        /* References Section Styling */
        .content-section.is-references { margin-top: 24px; padding-top: 16px; border-top: 1px solid #262626; }
        .content-section.is-references .section-title { color: #60a5fa; }
        .content-section.is-references .section-body ul { list-style: none; padding-left: 0; }
        .content-section.is-references .section-body li { margin-bottom: 8px; padding-left: 20px; position: relative; }
        .content-section.is-references .section-body li:before { content: "→"; position: absolute; left: 0; color: #60a5fa; font-weight: bold; }
        .content-section.is-references .section-body a { color: #60a5fa; text-decoration: none; transition: color 0.2s; }
        .content-section.is-references .section-body a:hover { color: #93c5fd; text-decoration: underline; }

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
        
        /* Tablet Responsive - Still Prioritize Content */
        @media (min-width: 768px) {
            .content-wrapper { padding: 0 24px; }
            .article-header { padding: 12px 0 8px; }
            .article-title { font-size: 1.5rem; margin-bottom: 6px; }
            .article-excerpt { font-size: 1rem; text-align: justify; }
            
            .article-content { padding: 20px; margin: 16px 0; border-radius: 12px; }
            .section-title { font-size: 1.375rem; margin-bottom: 12px; }
            .section-body { font-size: 1rem; line-height: 1.6; margin-bottom: 16px; }
        }
        
        /* Mobile Responsive - Compact Footer */
        @media (max-width: 768px) {
            .footer-content { padding: 8px 16px; }
            .footer-links { gap: 8px; }
            .footer-links a { font-size: 11px; }
            .footer-text { font-size: 10px; }
        }
        
        /* Desktop Responsive - Optimized Layout */
        @media (min-width: 1024px) {
            .article-title { font-size: 1.75rem; }
            .article-content { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="content-wrapper">
            <!-- Minimal Article Header - No Metadata -->
            <header class="article-header">
                <h1 class="article-title">${escapeHtml(article.title)}</h1>
                ${article.excerpt ? `<p class="article-excerpt">${escapeHtml(article.excerpt)}</p>` : ''}
                
                <!-- Related Search 1 - Below Excerpt -->
                <div id="relatedsearches1"></div>
            </header>

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

   <!-- AdSense for Search & Scripts -->
<script async src="https://www.google.com/adsense/search/ads.js"></script>
<script type="text/javascript" charset="utf-8">
const urlParams = new URLSearchParams(window.location.search);
const rac = urlParams.get('adtitle') || "Learn More";
const terms = urlParams.get('terms') || "";
const lang = urlParams.get('lang') || "en";
const style_id = urlParams.get('style_id') || "";
const channel_id = urlParams.get('channel_id') || "";
const utm_source = urlParams.get('utm_source') || "direct";
const clickid = urlParams.get('clickid') || "0000";
// Check if containers exist
const container1 = document.getElementById('relatedsearches1');
const container2 = document.getElementById('relatedsearches2');
var pageOptions = {
"pubId": "partner-pub-6567805284657549",
"styleId": style_id,
"channel": channel_id,
"relatedSearchTargeting": "content",
"resultsPageBaseUrl": "https://search.termuxtools.com/search?style_id=" + encodeURIComponent(style_id) + "&channel_id=" + encodeURIComponent(channel_id) + "&utm_source=" + encodeURIComponent(utm_source) + "&clickid=" + encodeURIComponent(clickid),
"adsafe": "low",
"resultsPageQueryParam": "q",
"linkTarget": "_blank",
"hl": lang,
"referrerAdCreative": rac,
"terms": terms || "",
"ignoredPageParams": "clickid,terms,rac,adtitle, gclid,wbraid,gbraid,campaignid,adgroupid,loc_physicall_ms,loc_interest_ms,matchtype,network,creative,keyword,placement,targetid,cpid"
};
var rsblock1 = {
"container": "relatedsearches1",
"relatedSearches": 5
};
_googCsa("relatedsearch", pageOptions, rsblock1);
</script>

    <script>
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
    </script>

    <!-- Structured Data -->
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${escapeHtml(article.title)}","description":"${escapeHtml(article.excerpt || '')}","author":{"@type":"Person","name":"${escapeHtml(article.author?.name || 'Search Termux')}"},"publisher":{"@type":"Organization","name":"Search Termux"},"datePublished":"${publishedISO}","articleSection":"${escapeHtml(categoryName)}"${imageMetaUrl ? `,"image":"${imageMetaUrl}"` : ''}}</script>
</body>
</html>`
} 
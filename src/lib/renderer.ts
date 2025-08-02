import { readFile } from 'fs/promises'
import { join } from 'path'
import type { Article, ArticleSection } from '@/types/database'

// Define placeholders for string replacement
const PLACEHOLDERS = {
  TITLE: '@@@TITLE@@@',
  CONTENT: '@@@CONTENT@@@',
  EXCERPT: '@@@EXCERPT@@@',
  AUTHOR_NAME: '@@@AUTHOR_NAME@@@',
  AUTHOR_AVATAR: '@@@AUTHOR_AVATAR@@@',
  PUBLISH_DATE: '@@@PUBLISH_DATE@@@',
  SLUG: '@@@SLUG@@@',
  PAGE_TITLE: '@@@PAGE_TITLE@@@',
  META_DESCRIPTION: '@@@META_DESCRIPTION@@@',
} as const

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Convert structured sections to HTML content
 */
function sectionsToHtml(sections: ArticleSection[]): string {
  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)
  
  return sortedSections.map(section => {
    const headerHtml = escapeHtml(section.header)
    // The content is already HTML from the rich text editor
    const contentHtml = section.content
    
    return `
      <section class="article-section">
        <h2 class="section-header">${headerHtml}</h2>
        <div class="section-content">
          ${contentHtml}
        </div>
      </section>
    `
  }).join('\n')
}

/**
 * Render an article to HTML using template and string replacement
 */
export async function renderTemplateHtml(article: Article & { author: { name: string; avatar_url?: string | null } }): Promise<string> {
  try {
    // Read the template file
    const templatePath = join(process.cwd(), 'src', 'templates', 'article-template.html')
    const template = await readFile(templatePath, 'utf-8')
    
    // Convert sections to HTML
    const contentHtml = sectionsToHtml(article.sections)
    
    // Prepare data for template
    const title = escapeHtml(article.title)
    const excerpt = escapeHtml(article.excerpt || '')
    const authorName = escapeHtml(article.author.name)
    const publishDate = formatDate(article.published_at)
    const slug = article.slug // Use the slug directly, no generation needed
    
    // Replace placeholders in template
    return template
      .replaceAll(PLACEHOLDERS.TITLE, title)
      .replaceAll(PLACEHOLDERS.EXCERPT, excerpt)
      .replaceAll(PLACEHOLDERS.CONTENT, contentHtml)
      .replaceAll(PLACEHOLDERS.AUTHOR_NAME, authorName)
      .replaceAll(PLACEHOLDERS.AUTHOR_AVATAR, article.author.avatar_url || '/default-avatar.png')
      .replaceAll(PLACEHOLDERS.PUBLISH_DATE, publishDate)
      .replaceAll(PLACEHOLDERS.SLUG, slug)
      
  } catch (error) {
    console.error('Error rendering article template:', error)
    throw new Error('Failed to render article template')
  }
}

/**
 * For development/testing when template might not be available
 */
export function renderSimpleHtml(article: Article & { author: { name: string; avatar_url?: string | null } }): string {
  try {
    const contentHtml = sectionsToHtml(article.sections)
    const title = escapeHtml(article.title)
    const excerpt = escapeHtml(article.excerpt || '')
    const authorName = escapeHtml(article.author.name)
    const publishDate = formatDate(article.published_at)
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Blog</title>
  <meta name="description" content="${excerpt}">
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      max-width: 42rem; 
      margin: 0 auto; 
      padding: 1rem; 
      line-height: 1.6; 
    }
    .article-meta { 
      color: #666; 
      margin-bottom: 2rem; 
    }
    h1 { 
      margin-bottom: 0.5rem; 
    }
    .article-section {
      margin-bottom: 3rem;
    }
    .section-header {
      color: #333;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #eee;
    }
    .section-content {
      margin-bottom: 2rem;
    }
    img { 
      max-width: 100%; 
      height: auto; 
    }
    pre { 
      background: #f4f4f4; 
      padding: 1rem; 
      overflow-x: auto; 
    }
    code { 
      background: #f4f4f4; 
      padding: 0.2rem 0.4rem; 
      border-radius: 3px; 
    }
  </style>
</head>
<body>
  <article>
    <h1>${title}</h1>
    <div class="article-meta">
      By ${authorName} • ${publishDate}
    </div>
    <div class="content">
      ${contentHtml}
    </div>
  </article>
</body>
</html>`
  } catch (error) {
    console.error('Error rendering simple HTML:', error)
    throw new Error('Failed to render simple HTML')
  }
} 
 
 
 
 
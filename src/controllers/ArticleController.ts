import { articleRepository, type CreateArticleData } from '@/repositories/ArticleRepository'
import { cloudflareService } from '@/services/CloudflareService'
import { renderStructuredArticleHtml } from '@/lib/structured-renderer'
import type { ArticleSection, ArticleForRender } from '@/types/database'

/**
 * Article Controller - Handles article business logic
 */
export class ArticleController {
  /**
   * Get all articles
   */
  async getAllArticles() {
    return articleRepository.findAll()
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new Error('Article not found')
    }
    return article
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string) {
    const article = await articleRepository.findBySlug(slug)
    if (!article) {
      throw new Error('Article not found')
    }
    return article
  }

  /**
   * Get articles by author
   */
  async getArticlesByAuthor(authorId: string) {
    return articleRepository.findByAuthor(authorId)
  }

  /**
   * Create and publish article
   */
  async createArticle(data: CreateArticleData, accountName?: string) {
    console.log(` Publishing article: ${data.title}`)
    
    // Ensure CSS files are available
    await cloudflareService.ensureCSSFiles()
    
    // Create article in database
    const article = await articleRepository.create(data)
    console.log(`Article created in database: ${article.id}`)
    
    // Generate and upload HTML
    const articleForRender: ArticleForRender = {
      ...article,
      sections: article.sections as ArticleSection[],
      published_at: article.published_at.toISOString(),
      author: article.author!
    }
    
    const html = await renderStructuredArticleHtml(articleForRender)
    await cloudflareService.uploadHtml(data.slug, html)
    console.log(` Article HTML uploaded: ${data.slug}`)
    
    // Get public URL and purge cache
    const publicUrl = cloudflareService.getPublicUrl(data.slug)
    
    try {
      await cloudflareService.purgeCache(publicUrl)
      console.log(' CDN cache purged')
    } catch (error) {
      console.warn('⚠️ Cache purge failed:', error)
    }
    
    console.log(`🎉 Published: ${article.title}`)
    console.log(`🔗 URL: ${publicUrl}`)
    
    // Optional: Log to Google Sheets
    await this.logToGoogleSheets(article, publicUrl, accountName)
    
    return { article, publicUrl }
  }

  /**
   * Update article
   */
  async updateArticle(id: string, data: Partial<CreateArticleData>) {
    console.log(` Updating article: ${id}`)
    
    const article = await articleRepository.update(id, data)
    
    // Re-generate and upload HTML
    if (data.title || data.sections || data.excerpt) {
      await cloudflareService.ensureCSSFiles()
      
      const articleForRender: ArticleForRender = {
        ...article,
        sections: article.sections as ArticleSection[],
        published_at: article.published_at.toISOString(),
        author: article.author!
      }
      
      const html = await renderStructuredArticleHtml(articleForRender)
      await cloudflareService.uploadHtml(article.slug, html)
      
      // Purge cache
      const publicUrl = cloudflareService.getPublicUrl(article.slug)
      await cloudflareService.purgeCache(publicUrl)
      
      console.log(`✅ Article updated: ${article.slug}`)
    }
    
    return article
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string) {
    const article = await articleRepository.findById(id)
    if (!article) {
      throw new Error('Article not found')
    }
    
    console.log(`🗑️ Deleting article: ${article.slug}`)
    
    // Delete from R2
    await cloudflareService.delete(article.slug)
    
    // Delete from database
    await articleRepository.delete(id)
    
    console.log(`✅ Article deleted: ${article.slug}`)
  }

  /**
   * Get article statistics
   */
  async getStatistics(authorId?: string) {
    if (authorId) {
      const count = await articleRepository.countByAuthor(authorId)
      return { totalArticles: count, publishedArticles: count }
    }
    
    const count = await articleRepository.count()
    return { totalArticles: count, publishedArticles: count }
  }

  /**
   * Log article to Google Sheets (optional)
   */
  private async logToGoogleSheets(article: any, publicUrl: string, accountName?: string) {
    try {
      const appsScriptUrl = process.env.GSHEETS_WEBAPP_URL
      if (!appsScriptUrl) return
      
      const createdAt = article.published_at instanceof Date
        ? article.published_at
        : new Date(article.published_at)
      
      const createdAtISO = createdAt.toISOString()
      const createdAtYMD = createdAtISO.slice(0, 10)
      
      const rowValues = [
        createdAtYMD,
        article.title,
        publicUrl,
        'Campaign Published',
        accountName || 'AFS_01',
        article.slug
      ]

      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalName: article.title,
          url: publicUrl,
          campaignStatus: 'Campaign Published',
          accountName: accountName || 'AFS_01',
          sheetId: process.env.GSHEETS_SHEET_ID,
          createdAtISO,
          createdAtYMD,
          slug: article.slug,
          rowValues,
        }),
      })
    } catch (error) {
      console.warn('⚠️ Failed to log to Google Sheets:', error)
    }
  }
}

// Singleton instance
export const articleController = new ArticleController()


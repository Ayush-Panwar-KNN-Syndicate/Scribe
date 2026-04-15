import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'
import { ArticleSection } from '@/types/database'

function sectionsToWordPressHtml(sections: ArticleSection[]): string {
  return sections
    .map((s) => {
      // Wrap each paragraph in <p> tags, splitting on double newlines
      const paragraphs = s.content
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
        .join('\n')

      return `<h2>${s.header}</h2>\n${paragraphs}`
    })
    .join('\n\n')
}

export async function POST(request: NextRequest) {
  try {
    const author = await getCurrentUser()
    if (!author) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wpUrl = process.env.WP_URL
    const wpUser = process.env.WP_USER
    const wpAppPassword = process.env.WP_APP_PASSWORD

    if (!wpUrl || !wpUser || !wpAppPassword) {
      console.error(' WordPress env vars missing: WP_URL, WP_USER, WP_APP_PASSWORD')
      return NextResponse.json(
        { error: 'WordPress credentials not configured' },
        { status: 500 }
      )
    }

    const articleData = await request.json()
    const { title, slug, excerpt, sections, category_id, status = 'publish' } = articleData

    if (!title || !slug || !sections?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, sections' },
        { status: 400 }
      )
    }

    const content = sectionsToWordPressHtml(sections as ArticleSection[])
    const credentials = Buffer.from(`${wpUser}:${wpAppPassword}`).toString('base64')
    const endpoint = `${wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`

    console.log(` Publishing to WordPress (${wpUrl}): ${title}`)

    const wpResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        status,
      }),
    })

    if (!wpResponse.ok) {
      const errorBody = await wpResponse.json().catch(() => ({}))
      console.error(' WordPress API error:', wpResponse.status, errorBody)
      return NextResponse.json(
        {
          error: 'WordPress publish failed',
          details: errorBody,
        },
        { status: wpResponse.status }
      )
    }

    const wpPost = await wpResponse.json()
    const postUrl: string = wpPost.link

    console.log(` Published to WordPress: ${postUrl}`)

    // Save article to local database so it appears on the dashboard
    try {
      await prisma.article.create({
        data: {
          title,
          slug,
          excerpt: excerpt || '',
          sections: sections as any,
          author_id: author.id,
          category_id: category_id || null,
          domain: 'carhp.com',
          published_at: new Date(),
        },
      })
      console.log(` Article saved to database for domain: carhp.com`)
    } catch (dbError) {
      // Log but don't fail — article is already live on WordPress
      console.warn(' Failed to save article to database (already published to WordPress):', dbError)
    }

    return NextResponse.json({ success: true, url: postUrl })
  } catch (error) {
    console.error(' WordPress publishing error:', error)
    return NextResponse.json(
      {
        error: 'Failed to publish to WordPress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

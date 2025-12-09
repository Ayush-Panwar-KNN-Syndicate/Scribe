import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { generateArticleFromTitle } from '@/lib/ai'
import { error } from 'console'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const title = String(body?.title || '').trim()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const generated = await generateArticleFromTitle(title, {
      categoryName: body?.categoryName || null,
      keywords: Array.isArray(body?.keywords) ? body.keywords.slice(0, 20) : undefined,
      template: undefined,
      // Pass account name for context/influence
      // We'll use it in the prompt to slightly influence brand tone later
      // without hard-coding any behavior.
      
      accountName: body?.accountName || null,
    })
    return NextResponse.json({ success: true, ...generated })
  } catch (error: any) {
    console.error('AI generation failed', error)
    const message = error?.message || 'Failed to generate article'
    const status = /unauthorized|invalid_api_key|401/i.test(message)
      ? 401
      : (/\b(503|UNAVAILABLE)\b/i.test(message) ? 503 : 500)
    return NextResponse.json({ success: false, error: message }, { status })
  }
}



import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { suggestTitlesFromKeywords } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const keywords = Array.isArray(body?.keywords)
      ? body.keywords
      : String(body?.keywords || '')
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)

    if (!keywords.length) {
      return NextResponse.json({ success: true, titles: [] })
    }

    const titles = await suggestTitlesFromKeywords(keywords)
    return NextResponse.json({ success: true, titles })
  } catch (error: any) {
    const msg = error?.message || 'Failed to suggest titles'
    const status = /unauthorized|invalid_api_key|401/i.test(msg)
      ? 401
      : (/\b(503|UNAVAILABLE)\b/i.test(msg) ? 503 : 500)
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}






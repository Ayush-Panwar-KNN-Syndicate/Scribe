export type GeneratedArticle = {
  slug: string
  excerpt: string
  sections: Array<{
    id: string
    order: number
    header: string
    content: string
  }>
}

export type GenerateArticleOptions = {
  categoryName?: string | null
  keywords?: string[]
  template?: string | null
  accountName?: string | null
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function generateArticleFromTitle(
  title: string,
  options: GenerateArticleOptions = {}
): Promise<GeneratedArticle> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your environment and restart the server.')
  }

  const maskedKey = apiKey.length > 10
    ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
    : '***'
  console.log('🔑 Using Gemini API key:', maskedKey, 'Length:', apiKey.length)

  const baseSlug = toSlug(title)
  const { categoryName, keywords, template, accountName } = options

  const prompt = `You are an expert content writer specializing in comprehensive, SEO-optimized articles. Create detailed, factual content as strict JSON.

TITLE: "${title}"

CONTEXT (if provided):
- Preferred Category: ${categoryName || 'N/A'}
- Keywords (prioritize naturally, avoid stuffing): ${(keywords && keywords.length) ? keywords.join(', ') : 'N/A'}
- Selected Account: ${accountName || 'N/A'}

STRICT REQUIREMENTS (must follow exactly):
Write a professional, SEO-optimized blog article following these exact rules:

Excerpt: 250-320 characters, compelling, keyword-rich, and search-friendly.

Headings: 4 to 6 in total. Each heading must have 5-13 words and be descriptive.

Sections: Each section must have 700-900 characters (not words).

Total length: At least 5000 characters across all sections.

Tone: Professional, informative, and practical, with subtle commercial intent.

Structure: The first section must be titled “Introduction”, and the last section must be “Conclusion” or “Summary”.

Content Requirements:

Make the article suitable for a search arbitrage landing page.

Naturally integrate multiple mentions of high-end European and American international brands, without sounding forced.

Highlight their popular products, services, or extra value propositions.

Incorporate high-RPC keywords relevant to luxury, premium lifestyle, high-value retail, and international services (use references from Google Keyword Planner for inspiration).

Ensure the brand mentions help capture related searches but flow naturally in context.

Do not mention countries explicitly; focus on brands and categories instead.
OUTPUT FORMAT:
Return STRICT JSON with keys: slug, excerpt, sections[].
Each sections[] item has: id, order, header, content.
Use a URL-safe slug derived from the title. Do NOT include markdown fences or extra commentary, only JSON.

EXAMPLE SHAPE (values are illustrative only):
{
  "slug": "article-title-url",
  "excerpt": "Brief, compelling description in 250-300 characters...",
  "sections": [
    { "id": "id-1", "order": 0, "header": "Introduction", "content": "700-900 chars..." },
    { "id": "id-2", "order": 1, "header": "Meaningful heading of 5 to 13 words", "content": "700-900 chars..." }
  ]
}`

  try {
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro']
    let lastErr: any = null
    let data: any = null

    for (let attempt = 0; attempt < 4; attempt++) {
      const model = models[Math.min(attempt, models.length - 1)]
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      })

      if (res.ok) {
        data = await res.json()
        lastErr = null
        break
      }

      const errorText = await res.text()
      lastErr = new Error(`Gemini API error: ${res.status} - ${errorText}`)

      if (res.status === 503 || res.status === 429) {
        const delayMs = Math.min(4000, 500 * Math.pow(2, attempt))
        await new Promise(r => setTimeout(r, delayMs))
        continue
      } else {
        break
      }
    }

    if (lastErr) throw lastErr

    const parts: any[] = data.candidates?.[0]?.content?.parts || []
    let rawText = parts
      .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
      .filter(Boolean)
      .join('\n') || '{}'
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```\s*$/i, '')
    const firstBrace = rawText.indexOf('{')
    const lastBrace = rawText.lastIndexOf('}')
    const jsonCandidate = firstBrace !== -1 && lastBrace !== -1 ? rawText.slice(firstBrace, lastBrace + 1) : rawText

    let parsed: any
    try {
      parsed = JSON.parse(jsonCandidate)
    } catch {
      try {
        parsed = JSON.parse(rawText)
      } catch {
        parsed = {}
      }
    }

    const slug = toSlug(parsed.slug || baseSlug)
    const excerpt = String(parsed.excerpt || '').slice(0, 320)

    let sections = Array.isArray(parsed.sections) && parsed.sections.length
      ? parsed.sections.map((s: any, idx: any) => ({
          id: String(s.id || (globalThis as any).crypto?.randomUUID?.() || `${Date.now()}-${idx}`),
          order: Number(s.order ?? idx),
          header: String(s.header || `Section ${idx + 1}`),
          content: String(s.content || '')
        }))
      : [
          { id: (globalThis as any).crypto?.randomUUID?.() || `${Date.now()}-0`, order: 0, header: 'Introduction', content: `This article discusses ${title}.` }
        ]

    while (sections.length < 4) {
      const idxAdd = sections.length
      sections.push({
        id: (globalThis as any).crypto?.randomUUID?.() || `${Date.now()}-${idxAdd}`,
        order: idxAdd,
        header: `Additional Insights ${idxAdd}`,
        content: (sections[0]?.content || `Details on ${title}.`).slice(0, 750)
      })
    }
    if (sections.length > 6) {
      sections = sections.slice(0, 6)
    }

    sections = sections.map((s: { id: string; order: number; header: string; content: string }, idx: number) => {
      const headerWords = s.header.split(/\s+/).filter(Boolean)
      let header = s.header
      if (headerWords.length > 13) {
        header = headerWords.slice(0, 13).join(' ')
      }
      let content = s.content
      if (content.length > 900) content = content.slice(0, 900)
      if (content.length < 700) {
        const pad = `\n\nAdditional details: ${title}.`
        while (content.length < 700) {
          content += pad
          if (content.length > 900) break
        }
      }
      return { ...s, order: idx, header, content }
    })

    return { slug, excerpt, sections }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`Failed to generate content with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function suggestTitlesFromKeywords(keywords: string[]): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your environment and restart the server.')
  }

  const cleaned = (keywords || []).map(k => String(k || '').trim()).filter(Boolean)
  if (!cleaned.length) return []

  const prompt = `Generate 5 distinct, meaningful blog article titles using the given keywords.

Keywords: ${cleaned.join(', ')}

Rules:
- Informational tone; avoid clickbait.
- Prefer patterns like: "A Guide to ...", "A Comprehensive Guide to ...", "All You Need to Know About ...", "Understanding ...".
- Each title must be 50-70 characters long (inclusive).
- Titles must be unique and not numbered.
- Output strictly as a JSON array of strings (e.g., ["Title 1", "Title 2", ...]).
`

  const models = ['gemini-1.5-flash', 'gemini-1.5-pro']
  let data: any = null
  let lastErr: any = null
  for (let attempt = 0; attempt < 4; attempt++) {
    const model = models[Math.min(attempt, models.length - 1)]
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 512 } })
    })
    if (res.ok) { data = await res.json(); lastErr = null; break }
    lastErr = await res.text()
    if (res.status === 503 || res.status === 429) {
      await new Promise(r => setTimeout(r, Math.min(3000, 500 * Math.pow(2, attempt))))
      continue
    }
    break
  }
  if (!data) throw new Error(`Gemini title suggestion failed: ${lastErr || 'unknown'}`)

  const parts: any[] = data.candidates?.[0]?.content?.parts || []
  let rawText = parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).filter(Boolean).join('\n')
  rawText = rawText.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```\s*$/i, '')
  const firstBracket = rawText.indexOf('[')
  const lastBracket = rawText.lastIndexOf(']')
  const jsonCandidate = firstBracket !== -1 && lastBracket !== -1 ? rawText.slice(firstBracket, lastBracket + 1) : rawText
  let titles: any
  try { titles = JSON.parse(jsonCandidate) } catch { try { titles = JSON.parse(rawText) } catch { titles = [] } }
  if (!Array.isArray(titles)) titles = []
  return titles
    .map((t: any) => typeof t === 'string' ? t : (t?.title || t?.text || t?.headline || ''))
    .map((s: string) => String(s).trim())
    .filter(Boolean)
    .slice(0, 5)
}

 
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
Write a professional, reader-friendly blog article following these exact rules:

Excerpt: 250-320 characters, compelling, naturally includes 1-2 primary concepts, and reads smoothly.

Headings: 4 to 6 in total. Each heading must have 5-13 words and be descriptive.

Sections: Each section must have 750-1000 characters (not words). Each section must end with a complete sentence and proper punctuation. NEVER cut off mid-word or mid-sentence.

Total length: At least 5500 characters across all sections (more is fine).

Tone: Professional, informative, and practical, with subtle commercial intent.

Structure: The first section must be titled "Introduction", and the last section must be "Conclusion" or "Summary". After the conclusion, include a short "References" section containing 2-3 external blog/article links in plain markdown list format (e.g., - [Title](https://example.com)).

Content Requirements:
- Write complete, well-formed sentences that end with proper punctuation (. ! ?)
- Ensure each section flows naturally and concludes properly
- NEVER cut off mid-sentence or mid-thought - always complete your thoughts
- Use single spaces between words, not double spaces
- Each section must end with a complete, meaningful sentence
- Ensure proper grammar and professional tone throughout
- IMPORTANT: Always finish sentences completely before moving to the next thought
- Each paragraph should be self-contained with proper conclusion

FORMATTING INSTRUCTIONS (apply to content text only; no visible HTML tags):
- Use only plain text and markdown
- No visible HTML tags anywhere (<h1>, <p>, <strong>, etc.)
- Paragraphs are 2-4 sentences with blank lines between paragraphs
- Use - or * for bullet points and 1. 2. for numbered lists
- Never include citation markers like [1], [2] in text

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
    let excerpt = String(parsed.excerpt || '').slice(0, 320)
    
    // Fix excerpt formatting - remove double spaces and ensure proper sentence completion
    excerpt = excerpt
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s+([.!?])/g, '$1') // Remove spaces before punctuation
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim()
    
    // Ensure excerpt ends with proper punctuation
    if (excerpt && !excerpt.match(/[.!?]$/)) {
      // Find the last complete sentence
      const lastSentenceEnd = Math.max(
        excerpt.lastIndexOf('.'),
        excerpt.lastIndexOf('!'),
        excerpt.lastIndexOf('?')
      )
      
      if (lastSentenceEnd > 0) {
        excerpt = excerpt.slice(0, lastSentenceEnd + 1)
      } else {
        excerpt = excerpt + '.'
      }
    }

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
      
      // Fix formatting issues first
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s+([.!?])/g, '$1') // Remove spaces before punctuation
        .trim()
      
      // AGGRESSIVE sentence completion - find the last complete sentence
      const findLastCompleteSentence = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        
        // Try to find the last complete sentence within the limit
        const truncated = text.slice(0, maxLength)
        
        // Look for sentence endings in reverse order
        const sentenceEndings = ['.', '!', '?']
        let lastCompleteIndex = -1
        
        for (const ending of sentenceEndings) {
          const lastIndex = truncated.lastIndexOf(ending)
          if (lastIndex > maxLength * 0.6) { // At least 60% of max length
            lastCompleteIndex = Math.max(lastCompleteIndex, lastIndex)
          }
        }
        
        if (lastCompleteIndex > 0) {
          return truncated.slice(0, lastCompleteIndex + 1)
        }
        
        // If no complete sentence found, find the last complete word
        const lastSpaceIndex = truncated.lastIndexOf(' ')
        if (lastSpaceIndex > maxLength * 0.6) {
          return truncated.slice(0, lastSpaceIndex) + '.'
        }
        
        // Last resort: truncate and add period
        return truncated + '.'
      }
      
      // Apply sentence completion
      content = findLastCompleteSentence(content, 900)
      
      // Ensure minimum length
      if (content.length < 700) {
        const additionalContent = ` This comprehensive guide provides valuable insights into ${title.toLowerCase()}, ensuring you have all the information needed to make informed decisions.`
        content = content + additionalContent
        
        // Re-apply sentence completion after adding content
        content = findLastCompleteSentence(content, 900)
      }
      
      // Final validation - ensure proper ending
      if (!content.match(/[.!?]$/)) {
        const lastSpaceIndex = content.lastIndexOf(' ')
        if (lastSpaceIndex > 0) {
          content = content.slice(0, lastSpaceIndex) + '.'
        } else {
          content = content + '.'
        }
      }
      
      // Final cleanup - ensure single spaces and proper formatting
      content = content.replace(/\s+/g, ' ').trim()
      
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

  const prompt = `You are an expert title generator. Use the following master framework to propose high-quality article titles.

INPUT KEYWORDS: ${cleaned.join(', ')}

GOAL: Return 3-5 distinct, high-intent, informative titles that follow proven patterns and drive clicks without clickbait.

FRAMEWORK CATEGORIES (pick different ones for each title):
1) Comprehensive Guide → "The Ultimate/Complete/Comprehensive Guide to [Keyword] [in Location/Industry]"
2) How-To/Process → "How [Keyword] [delivers benefit]" or "How to [Action] with [Keyword]"
3) Benefits/Value → "Understanding/Top Benefits of [Keyword] for [Audience]"
4) Selection/Decision → "Choosing the Right [Keyword] for [Context]" or "Top Features to Consider in [Keyword]"
5) Applications/Types → "[Keyword]: Applications, Types, and Uses in [Industry/Location]"
6) Everything/All You Need → "Everything/All You Need to Know About [Keyword]"

STRICT RULES:
- 3 to 5 titles total
- 8 to 15 words per title (not characters)
- Each title must follow a different category/pattern
- Use natural keyword integration; no stuffing
- Avoid clickbait and vague language
- Use single spaces; proper capitalization; no numbering
- Output ONLY a JSON array of strings (e.g., ["Title 1", "Title 2"]).`

  const models = ['gemini-1.5-flash', 'gemini-1.5-pro']
  let data: any = null
  let lastErr: any = null
  for (let attempt = 0; attempt < 4; attempt++) {
    const model = models[Math.min(attempt, models.length - 1)]
      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 256,
            responseMimeType: 'application/json'
          }
        })
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

  const parts: any[] = data?.candidates?.[0]?.content?.parts || []
  let rawText = parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).filter(Boolean).join('\n')

  // If the model returned empty parts or was truncated, perform a focused fallback request
  if (!rawText || rawText.trim().length === 0) {
    try {
      const minimalPrompt = `From these keywords: ${cleaned.join(', ')}\n\nReturn ONLY a JSON array of 3 to 5 distinct, well-formed titles.\nRules:\n- 8 to 15 words per title\n- No numbering\n- No extra text before or after the JSON array`;
      const fallbackModels = ['gemini-2.5-pro', 'gemini-2.0-flash'];
      for (const fbModel of fallbackModels) {
        const fbRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${fbModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: minimalPrompt }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json'
            }
          })
        })
        if (fbRes.ok) {
          const fbData = await fbRes.json()
          const fbParts: any[] = fbData?.candidates?.[0]?.content?.parts || []
          rawText = fbParts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).filter(Boolean).join('\n')
          if (rawText && rawText.trim()) break
        } else {
          // If rate limited/unavailable, try next fallback
          if (fbRes.status === 503 || fbRes.status === 429) continue
        }
      }
    } catch {}
  }
  rawText = rawText.replace(/^```json\s*/i, '').replace(/^```/i, '').replace(/```\s*$/i, '')
  const firstBracket = rawText.indexOf('[')
  const lastBracket = rawText.lastIndexOf(']')
  const jsonCandidate = firstBracket !== -1 && lastBracket !== -1 ? rawText.slice(firstBracket, lastBracket + 1) : rawText
  let titles: any
  // Primary parse attempts
  try { titles = JSON.parse(jsonCandidate) } catch {
    try { titles = JSON.parse(rawText) } catch {
      // Fallback 1: find a JSON array substring
      const m = rawText.match(/\[[\s\S]*\]/)
      if (m) {
        try { titles = JSON.parse(m[0]) } catch { titles = [] }
      } else {
        titles = []
      }
    }
  }
  // Fallback 2: extract quoted strings
  if (!Array.isArray(titles) || titles.length === 0) {
    const quoted = rawText.match(/"([^"]{8,120})"/g) || []
    titles = quoted.map(s => s.replace(/^"|"$/g, ''))
  }
  // Fallback 3: split lines and clean
  if (!Array.isArray(titles) || titles.length === 0) {
    titles = rawText.split(/\r?\n|\s*\d+\.|\s*[-•]\s+/)
      .map(s => String(s).trim())
      .filter(Boolean)
  }
  // Normalize, dedupe, enforce 8-15 words, cap at 5
  const seen = new Set<string>()
  const result: string[] = []
  for (const t of titles) {
    const s = String(typeof t === 'string' ? t : (t?.title || t?.text || t?.headline || '')).trim()
    if (!s) continue
    const words = s.split(/\s+/)
    if (words.length < 8 || words.length > 15) continue
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(s)
    if (result.length >= 5) break
  }
  return result
}

 
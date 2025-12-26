import { NextRequest, NextResponse } from 'next/server'

const wordcut = require('wordcut')

// Initialize wordcut once
wordcut.init()

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Use wordcut to segment Thai text (returns pipe-separated words)
    const segmented = wordcut.cut(text)

    // Replace pipes with spaces for slug generation
    const withSpaces = segmented.replace(/\|/g, ' ')

    return NextResponse.json({
      success: true,
      segmented: withSpaces
    })
  } catch (error) {
    console.error('Thai segmentation error:', error)
    return NextResponse.json(
      { error: 'Failed to segment Thai text' },
      { status: 500 }
    )
  }
}

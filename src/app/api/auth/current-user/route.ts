import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Supabase auth (cookies allowed here)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(null, { status: 401 })
    }

    // Prisma author lookup
    const author = await prisma.author.findUnique({
      where: { email: user.email },
    })

    if (!author) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json({
      id: author.id,
      email: author.email,
      role: author.role,
      name: author.name,
      avatar: author.avatar_url,
    })
  } catch (error) {
    console.error('GET /api/auth/current-user error:', error)
    return NextResponse.json(null, { status: 500 })
  }
}

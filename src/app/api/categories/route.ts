import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get domain from query parameters
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain') || 'topreserchtopics.com'

    const categories = await prisma.category.findMany({
      where: {
        domain: domain,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ success: false, categories: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const author = await getCurrentUser()
    if (!author) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, domain } = await request.json()

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        domain: domain || 'topreserchtopics.com',
      },
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ success: false, category: null }, { status: 500 })
  }
} 
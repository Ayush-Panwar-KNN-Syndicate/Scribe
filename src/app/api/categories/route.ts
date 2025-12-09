import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-prisma'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
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
    
    const { name } = await request.json()
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ success: false, category: null }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-prisma'
import { uploadImageToCloudflare } from '@/lib/cloudflare-images'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const author = await requireAuth()
    if (!author) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Get the form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const slug = formData.get('slug') as string | null

    if (!file) {
      return new NextResponse('No file provided', { status: 400 })
    }

    // Slug is optional: allow upload without it

    // 3. Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return new NextResponse('Invalid file type. Please use JPEG, PNG, WebP, or GIF', { status: 400 })
    }

    // 4. Validate file size (max 10MB - Cloudflare Images supports larger files)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return new NextResponse('File too large. Maximum size is 10MB', { status: 400 })
    }

    // 5. Upload to Cloudflare Images (automatic optimization!)
    const result = await uploadImageToCloudflare(file, slug ?? undefined)

    console.log(`✅ Image uploaded to Cloudflare Images: ${result.id}`)

    // 6. Return the image ID and primary URL
    return NextResponse.json({ 
      success: true,
      id: result.id,
      url: result.url,
      variants: result.variants
    })

  } catch (error) {
    console.error('❌ Image upload error:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Upload failed', 
      { status: 500 }
    )
  }
} 
 
 
 
 
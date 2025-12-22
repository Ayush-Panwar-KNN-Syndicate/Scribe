import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/PrismaService'

// Enable CORS for tracking endpoint
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      is_blocked,
      channel_id,
      style_id,
      user_agent,
      referrer,
      anura_result
    } = body

    // Extract IP address from headers (common proxy headers)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               req.headers.get('cf-connecting-ip') || // Cloudflare
               'unknown'

    // Extract country code from Cloudflare or Vercel headers
    const country = req.headers.get('cf-ipcountry') || // Cloudflare
                    req.headers.get('x-vercel-ip-country') || // Vercel
                    null

    // Create traffic log entry
    const trafficLog = await prisma.trafficLog.create({
      data: {
        is_blocked: is_blocked || false,
        channel_id: channel_id || null,
        style_id: style_id || null,
        ip_address: ip,
        country_code: country,
        user_agent: user_agent || null,
        referrer: referrer || null,
        anura_result: anura_result || null
      }
    })

    // Return with CORS headers
    return NextResponse.json({
      success: true,
      id: trafficLog.id
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('Error tracking traffic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track traffic' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/PrismaService'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'blocked' // 'blocked', 'good', or 'all'
    const limit = parseInt(searchParams.get('limit') || '1000')

    let whereClause: any = {}

    if (type === 'blocked') {
      whereClause = { is_blocked: true }
    } else if (type === 'good') {
      whereClause = { is_blocked: false }
    }
    // if 'all', no where clause

    const trafficLogs = await prisma.trafficLog.findMany({
      where: whereClause,
      select: {
        id: true,
        is_blocked: true,
        channel_id: true,
        style_id: true,
        ip_address: true,
        country_code: true,
        user_agent: true,
        referrer: true,
        anura_result: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    })

    // Format data for export
    const exportData = trafficLogs.map(log => ({
      id: log.id,
      blocked: log.is_blocked,
      channel_id: log.channel_id || 'N/A',
      style_id: log.style_id || 'N/A',
      ip_address: log.ip_address || 'N/A',
      country_code: log.country_code || 'N/A',
      user_agent: log.user_agent || 'N/A',
      referrer: log.referrer || 'N/A',
      anura_result: log.anura_result || 'N/A',
      timestamp: log.created_at.toISOString()
    }))

    const response = NextResponse.json({
      success: true,
      exportDate: new Date().toISOString(),
      type,
      totalRecords: exportData.length,
      data: exportData
    })

    // Set headers to trigger download
    response.headers.set('Content-Disposition', `attachment; filename="anura-traffic-${type}-${Date.now()}.json"`)

    return response

  } catch (error) {
    console.error('Error exporting traffic data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export traffic data' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/services/PrismaService'

export async function GET(req: NextRequest) {
  try {
    // Get total counts
    const totalTraffic = await prisma.trafficLog.count()
    const blockedTraffic = await prisma.trafficLog.count({
      where: { is_blocked: true }
    })
    const goodTraffic = await prisma.trafficLog.count({
      where: { is_blocked: false }
    })

    // Get recent blocked traffic stats by channel
    const blockedByChannel = await prisma.trafficLog.groupBy({
      by: ['channel_id'],
      where: {
        is_blocked: true,
        channel_id: { not: null }
      },
      _count: true
    })

    // Get recent blocked traffic stats by style
    const blockedByStyle = await prisma.trafficLog.groupBy({
      by: ['style_id'],
      where: {
        is_blocked: true,
        style_id: { not: null }
      },
      _count: true
    })

    // Get recent blocked traffic stats by country
    const blockedByCountry = await prisma.trafficLog.groupBy({
      by: ['country_code'],
      where: {
        is_blocked: true,
        country_code: { not: null }
      },
      _count: true
    })

    // Get stats for the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const blockedLast24h = await prisma.trafficLog.count({
      where: {
        is_blocked: true,
        created_at: { gte: last24Hours }
      }
    })
    const goodLast24h = await prisma.trafficLog.count({
      where: {
        is_blocked: false,
        created_at: { gte: last24Hours }
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        total: totalTraffic,
        blocked: blockedTraffic,
        good: goodTraffic,
        blockRate: totalTraffic > 0 ? ((blockedTraffic / totalTraffic) * 100).toFixed(2) : '0.00',
        last24Hours: {
          blocked: blockedLast24h,
          good: goodLast24h,
          total: blockedLast24h + goodLast24h
        },
        breakdown: {
          byChannel: blockedByChannel.map(item => ({
            channel_id: item.channel_id,
            count: item._count
          })),
          byStyle: blockedByStyle.map(item => ({
            style_id: item.style_id,
            count: item._count
          })),
          byCountry: blockedByCountry.map(item => ({
            country_code: item.country_code,
            count: item._count
          }))
        }
      }
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

'use client'

import { useEffect, useState } from 'react'

interface TrafficStats {
  total: number
  blocked: number
  good: number
  blockRate: string
  last24Hours: {
    blocked: number
    good: number
    total: number
  }
  breakdown: {
    byChannel: Array<{ channel_id: string; count: number }>
    byStyle: Array<{ style_id: string; count: number }>
    byCountry: Array<{ country_code: string; count: number }>
  }
}

export default function AnuraAdminPage() {
  const [stats, setStats] = useState<TrafficStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/anura/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'blocked' | 'good' | 'all') => {
    try {
      setExporting(true)
      const response = await fetch(`/api/anura/export?type=${type}&limit=10000`)
      const data = await response.json()

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `anura-traffic-${type}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Anura Traffic Dashboard</h1>
          <p className="text-gray-400">Monitor and export blocked traffic data</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Traffic</div>
            <div className="text-3xl font-bold">{stats?.total.toLocaleString()}</div>
          </div>

          <div className="bg-gray-900 border border-red-900/30 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Blocked Traffic</div>
            <div className="text-3xl font-bold text-red-400">{stats?.blocked.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">{stats?.blockRate}% blocked</div>
          </div>

          <div className="bg-gray-900 border border-green-900/30 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Good Traffic</div>
            <div className="text-3xl font-bold text-green-400">{stats?.good.toLocaleString()}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Last 24 Hours</div>
            <div className="text-xl font-bold">{stats?.last24Hours.total.toLocaleString()}</div>
            <div className="text-sm text-red-400">{stats?.last24Hours.blocked} blocked</div>
            <div className="text-sm text-green-400">{stats?.last24Hours.good} good</div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Export Data</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleExport('blocked')}
              disabled={exporting}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export Blocked Traffic'}
            </button>
            <button
              onClick={() => handleExport('good')}
              disabled={exporting}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export Good Traffic'}
            </button>
            <button
              onClick={() => handleExport('all')}
              disabled={exporting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export All Traffic'}
            </button>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg font-medium transition-colors"
            >
              Refresh Stats
            </button>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* By Channel */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Blocked by Channel</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats?.breakdown.byChannel.length === 0 ? (
                <div className="text-gray-500 text-sm">No data available</div>
              ) : (
                stats?.breakdown.byChannel.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-mono text-sm">{item.channel_id}</span>
                    <span className="text-red-400 font-bold">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* By Style */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Blocked by Style</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats?.breakdown.byStyle.length === 0 ? (
                <div className="text-gray-500 text-sm">No data available</div>
              ) : (
                stats?.breakdown.byStyle.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-mono text-sm">{item.style_id}</span>
                    <span className="text-red-400 font-bold">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* By Country */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Blocked by Country</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats?.breakdown.byCountry.length === 0 ? (
                <div className="text-gray-500 text-sm">No data available</div>
              ) : (
                stats?.breakdown.byCountry.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-gray-400 font-mono text-sm">{item.country_code}</span>
                    <span className="text-red-400 font-bold">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Export Format Info */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">Export Format</h3>
          <p className="text-gray-400 text-sm mb-2">
            Exported JSON files will contain the following fields for each traffic record:
          </p>
          <div className="bg-gray-950 rounded p-4 font-mono text-sm text-gray-300">
            <div>- id: Unique identifier</div>
            <div>- blocked: true/false</div>
            <div>- channel_id: Channel identifier</div>
            <div>- style_id: Style identifier</div>
            <div>- ip_address: IP address (if available)</div>
            <div>- country_code: Country code (if available)</div>
            <div>- user_agent: Browser user agent</div>
            <div>- referrer: HTTP referrer</div>
            <div>- anura_result: Anura detection result</div>
            <div>- timestamp: ISO timestamp</div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useDomain } from '@/contexts/DomainContext'
import { Globe } from 'lucide-react'

export function DomainSelector() {
  const { currentDomain, allDomains, setCurrentDomain, isLoading } = useDomain()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Globe className="w-4 h-4 flex-shrink-0" />
        <span>Loading...</span>
      </div>
    )
  }

  if (allDomains.length === 0) {
    return null
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
        <Globe className="w-3.5 h-3.5" />
        <span>Publishing Domain</span>
      </label>
      <select
        value={currentDomain?.id || ''}
        onChange={(e) => {
          const domain = allDomains.find(d => d.id === e.target.value)
          if (domain) {
            setCurrentDomain(domain)
          }
        }}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-300"
      >
        {allDomains.map(domain => (
          <option key={domain.id} value={domain.id}>
            {domain.siteName}
          </option>
        ))}
      </select>
    </div>
  )
}

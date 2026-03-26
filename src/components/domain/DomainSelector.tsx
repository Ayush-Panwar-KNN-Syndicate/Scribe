'use client'

import { useDomain } from '@/contexts/DomainContext'

export function DomainSelector() {
  const { currentDomain, allDomains, setCurrentDomain, isLoading } = useDomain()

  if (isLoading) {
    return (
      <div className="px-3 py-2 text-sm text-gray-500">
        Loading domains...
      </div>
    )
  }

  if (allDomains.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Publishing to:</span>
      <select
        value={currentDomain?.id || ''}
        onChange={(e) => {
          const domain = allDomains.find(d => d.id === e.target.value)
          if (domain) {
            setCurrentDomain(domain)
          }
        }}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

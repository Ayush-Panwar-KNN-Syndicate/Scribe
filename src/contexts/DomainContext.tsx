'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Domain = {
  id: string
  domain: string
  siteName: string
  tagline: string
  email: string
  r2Bucket: string
  r2PublicUrl: string
  apiUrl: string
  isActive: boolean
}

type DomainContextType = {
  currentDomain: Domain | null
  allDomains: Domain[]
  setCurrentDomain: (domain: Domain) => void
  isLoading: boolean
}

const DomainContext = createContext<DomainContextType>({
  currentDomain: null,
  allDomains: [],
  setCurrentDomain: () => {},
  isLoading: true,
})

export function DomainProvider({ children }: { children: ReactNode }) {
  const [currentDomain, setCurrentDomainState] = useState<Domain | null>(null)
  const [allDomains, setAllDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch domains from API
    fetch('/api/domains')
      .then(res => res.json())
      .then(data => {
        setAllDomains(data.domains)

        // Try to restore saved domain from localStorage
        const savedDomainId = localStorage.getItem('selectedDomainId')
        if (savedDomainId) {
          const savedDomain = data.domains.find((d: Domain) => d.id === savedDomainId)
          if (savedDomain) {
            setCurrentDomainState(savedDomain)
            setIsLoading(false)
            return
          }
        }

        // Default to first domain (TRT)
        if (data.domains.length > 0) {
          setCurrentDomainState(data.domains[0])
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch domains:', error)
        setIsLoading(false)
      })
  }, [])

  const setCurrentDomain = (domain: Domain) => {
    setCurrentDomainState(domain)
    localStorage.setItem('selectedDomainId', domain.id)
  }

  return (
    <DomainContext.Provider value={{ currentDomain, allDomains, setCurrentDomain, isLoading }}>
      {children}
    </DomainContext.Provider>
  )
}

export const useDomain = () => {
  const context = useContext(DomainContext)
  if (!context) {
    throw new Error('useDomain must be used within a DomainProvider')
  }
  return context
}

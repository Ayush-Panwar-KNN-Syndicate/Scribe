'use client'

import { ReactNode } from 'react'
import { DomainProvider } from '@/contexts/DomainContext'

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  return (
    <DomainProvider>
      {children}
    </DomainProvider>
  )
}

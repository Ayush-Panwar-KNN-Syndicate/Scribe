'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'

export default function ErrorMessage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) {
      setMessage({ type: 'error', text: error })
    } else if (success) {
      setMessage({ type: 'success', text: success })
    }
  }, [searchParams])

  if (!message) return null

  return (
    <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </div>
        <button
          onClick={() => setMessage(null)}
          className={`p-1 rounded-md hover:bg-opacity-80 ${
            message.type === 'error' ? 'hover:bg-red-100' : 'hover:bg-green-100'
          }`}
        >
          <X className={`h-4 w-4 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`} />
        </button>
      </div>
    </Alert>
  )
} 
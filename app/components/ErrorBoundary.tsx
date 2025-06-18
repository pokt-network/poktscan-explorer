'use client'
import { CircleX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

interface ErrorBandProps<T> {
  RenderElement: (props: T) => React.JSX.Element
  getProps: () => Promise<T>
  fallback?: React.ReactNode
  errorMessage?: string
}

export default function ErrorBoundary<T>({
  RenderElement,
  getProps,
  fallback,
  errorMessage = "Oops. There was an error loading the data."
}: ErrorBandProps<T>) {
  const [state, setState] = useState<{
    status: 'error' | 'loading' | 'success'
    data: T | null
    retryCount: number
  }>({
    status: 'error',
    data: null,
    retryCount: 0
  })

  const handleRetry = async () => {
    setState(prev => ({
      ...prev,
      status: 'loading',
      retryCount: prev.retryCount + 1
    }))

    try {
      const data = await getProps()
      setState(prev => ({
        ...prev,
        status: 'success',
        data
      }))
    } catch (error) {
      console.error('ErrorBand retry failed:', error)
      setState(prev => ({
        ...prev,
        status: 'error',
        data: null
      }))
    }
  }

  if (state.status === 'loading') {
    return <>{fallback}</>
  }

  if (state.status === 'success' && state.data) {
    return <RenderElement {...state.data} />
  }

  return (
    <div className="grow flex flex-col justify-center items-center bg-[color:--main-background] p-4 rounded-lg border border-[color:--divider] gap-0 base-shadow">
      <CircleX className="text-[color:--error] mb-2 h-8 w-8" />
      <p className="tracking-wide">{errorMessage}</p>
      <Button onClick={handleRetry}>
        Retry {state.retryCount > 0 && `(${state.retryCount})`}
      </Button>
    </div>
  )
}

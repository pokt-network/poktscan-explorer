'use client'
import { CircleX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  errorMessage,
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
    <div className={'bg-[color:--main-background] rounded-lg border border-[color:--divider] base-shadow p-4'}>
      <BaseRetryError
        onRetry={handleRetry}
        errorMessage={errorMessage}
      />
    </div>
  )
}

interface BaseRetryErrorProps {
  onRetry?: () => void
  errorMessage?: string
}

export function BaseRetryError({
  onRetry,
  errorMessage = "Oops. There was an error loading the data."
}: BaseRetryErrorProps) {

  return (
    <div className="grow flex flex-col justify-center items-center">
      <CircleX className="text-[color:--error] mb-2 h-8 w-8" />
      <p className="tracking-wide">{errorMessage}</p>
      <Button onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

interface RefreshPageErrorProps {
  errorMessage?: string
}

export function RefreshPageError({errorMessage}: RefreshPageErrorProps) {
  const router = useRouter()

  return (
      <div className={"w-full grow h-[500px] flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <BaseRetryError
        onRetry={router.refresh}
        errorMessage={errorMessage}
      />
    </div>
  )
}

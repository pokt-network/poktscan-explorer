'use client'

import React from 'react'
import { Card, DisplayMessages, MessagesLoader } from '@/app/(details)/tx/[id]/Messages'
import { getEvents } from '@/app/(details)/tx/[id]/getTx'
import NoData from '@/app/components/NoData'
import { useQuery } from '@tanstack/react-query'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

interface EventsProps {
  hash: string
  rpcUrl: string
}

export default function Events({hash, rpcUrl}: EventsProps) {
  const {isError, isLoading, data: events, refetch} = useQuery({
    queryKey: ['tx', hash, 'events'],
    queryFn: () => getEvents(hash, rpcUrl),
  })

  let content: React.ReactNode

  if (isLoading) {
    content = (
      <MessagesLoader />
    )
  } else if (isError) {
    content = (
      <div className={'flex grow justify-center items-center'}>
        <BaseRetryError onRetry={refetch} />
      </div>
    )
  } else if (!events || events.length === 0) {
    content = <NoData label={'No Events found.'} />
  } else {
    content = <DisplayMessages messages={events} />
  }

  return (
    <Card>
      {content}
    </Card>
  )
}

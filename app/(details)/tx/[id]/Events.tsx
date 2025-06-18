import React, { Suspense } from 'react'
import { Card, DisplayMessages, MessagesLoader } from '@/app/(details)/tx/[id]/Messages'
import { getEvents } from '@/app/(details)/tx/[id]/getTx'

const rpcUrl = process.env.RPC_BASE_URL!

interface EventsProps {
  hash: string
}

async function ServerEvents({hash}: EventsProps) {
  const events = await getEvents(hash, rpcUrl)

  return (
    <DisplayMessages messages={events} />
  )
}

export default function Events({hash}: EventsProps) {
  return (
    <Card>
      <Suspense
        key={hash}
        fallback={
          <MessagesLoader />
        }
      >
        <ServerEvents hash={hash} />
      </Suspense>
    </Card>
  )
}

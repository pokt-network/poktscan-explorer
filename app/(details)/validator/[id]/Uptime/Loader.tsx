import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Legend from '@/app/(details)/validator/[id]/Uptime/Legend'

interface UptimeLoaderProps {
  amountOfBlocks: number
}

export default function UptimeLoader({amountOfBlocks}: UptimeLoaderProps) {
  return (
    <>
      <Legend />
      <div className={'px-4 pb-4 gap-1.5 grid [&_div]:!h-4 [&_div]:min-w-4 [&_div]:!rounded-none grid-cols-[repeat(auto-fit,minmax(16px,1fr))]'}>
        {Array.from({length: amountOfBlocks + 1}).map((_, index) => (
          <Skeleton key={index} />
        ))}
      </div>
    </>
  )
}

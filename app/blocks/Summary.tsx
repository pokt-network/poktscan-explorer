'use client'

import useFetchOnBlock, { DocumentNodeData } from "../hooks/useFetchOnBlock"
import { blockSummaryDocument } from "./operations"
import { getSummaryVariables } from '@/app/blocks/utils'
import React, { useCallback } from 'react'
import FourCard from '@/app/components/FourCard'
import EntityLink from '@/app/components/EntityLink'
import { formatTimeDifference } from '@/app/(home)/utils'
import millify from 'millify'

interface SummaryProps {
  initialData: DocumentNodeData<typeof blockSummaryDocument>
}

export default function Summary({initialData}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const data = useFetchOnBlock({
    query: blockSummaryDocument,
    initialResult: initialData,
    variables
  })

  const latestBlock = data?.avgs?.nodes?.at(0)

  return (
    <FourCard
      items={[
        {
          label: 'Last Block',
          children: (
            <EntityLink
              entity={'block'}
              entityId={latestBlock?.height || 1}
            />
          )
        },
        {
          label: 'Transactions',
          children: latestBlock?.totalTxs
        },
        {
          label: 'Production Time (Avg. 24H)',
          children: formatTimeDifference(data?.avgs?.aggregates?.average?.timeToBlock || 0)
        },
        {
          label: 'Total Size (Avg. 24H)',
          children: millify(data?.avgs?.aggregates?.average?.size || 0, {
            units: ["B", "KB", "MB", "GB", "TB"],
            space: true,
          })
        },
      ]}
    />
  )
}

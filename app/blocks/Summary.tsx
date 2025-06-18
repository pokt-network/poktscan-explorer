'use client'

import useFetchOnBlock, { DocumentNodeData } from "../hooks/useFetchOnBlock"
import { blockSummaryDocument } from "./operations"
import { getSummaryVariables } from '@/app/blocks/utils'
import React, { useCallback } from 'react'
import FourCard from '@/app/components/FourCard'
import EntityLink from '@/app/components/EntityLink'
import { formatTimeDifference } from '@/app/(home)/utils'
import millify from 'millify'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'

interface SummaryProps {
  initialData: DocumentNodeData<typeof blockSummaryDocument>
  labels: LabelByIndex
}

export default function Summary({initialData, labels}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const data = useFetchOnBlock({
    query: blockSummaryDocument,
    initialResult: initialData,
    variables
  })

  const latestBlock = data?.avgs?.nodes?.at(0)

  return (
    <FourCard
      items={
        combineByIndex(
          labels,
          {
            1: (
              <EntityLink
                entity={'block'}
                entityId={latestBlock?.height || 1}
              />
            ),
            2: latestBlock?.totalTxs,
            3: formatTimeDifference(data?.avgs?.aggregates?.average?.timeToBlock || 0),
            4: millify(data?.avgs?.aggregates?.average?.size || 0, {
              units: ["B", "KB", "MB", "GB", "TB"],
              space: true,
            })
          }
        )
      }
    />
  )
}

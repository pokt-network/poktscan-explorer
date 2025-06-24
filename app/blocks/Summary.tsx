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
import { LoadingSummary } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

interface SummaryProps {
  initialData: DocumentNodeData<typeof blockSummaryDocument>
  labels: LabelByIndex
  initialError: boolean
}

export default function Summary({initialData, initialError, labels}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const { data, refetch, error, isLoading } = useFetchOnBlock({
    query: blockSummaryDocument,
    initialResult: initialData,
    variables,
    initialError
  })

  if (isLoading) {
    return (
      <LoadingSummary
        labels={labels}
      />
    )
  } else if (error) {
    return (
      <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the summary data.'}
        />
      </div>
    )
  }

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

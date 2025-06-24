'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { transactionsSummaryDocument } from '@/app/txs/operations'
import FourCard from '@/app/components/FourCard'
import React, { useCallback } from 'react'
import { getSummaryVariables, transactionsSummaryLabels } from '@/app/txs/utils'
import { combineByIndex } from '@/app/components/FourCards/utils'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { LoadingSummary } from '@/app/components/LoadingListView'

interface SummaryProps {
  initialData: DocumentNodeData<typeof transactionsSummaryDocument>
  initialError: boolean
}

export default function Summary({initialData, initialError}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const { data, error, isLoading, refetch} = useFetchOnBlock({
    query: transactionsSummaryDocument,
    variables,
    initialResult: initialData,
    initialError,
  })

  if (isLoading) {
    return (
      <LoadingSummary
        labels= {transactionsSummaryLabels}
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

  return (
    <FourCard
      items={
        combineByIndex(
          transactionsSummaryLabels,
          {
            1: data.validTxs.totalCount,
            2: data.failedTxs.totalCount,
            3: data.validTxs.totalCount + data.failedTxs.totalCount,
            4: data.blocks?.nodes?.at(0)?.totalTxs || 0,
          }
        )
      }
    />
  )
}

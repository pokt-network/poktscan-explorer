'use client'

import { accountSummaryDocument } from '@/app/accounts/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useCallback } from 'react'
import { getSummaryVariables } from '@/app/accounts/utils'
import FourCard from '@/app/components/FourCard'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'
import { LoadingSummary } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

interface SummaryProps {
  initialData: DocumentNodeData<typeof accountSummaryDocument>
  labels: LabelByIndex
  initialError: boolean
}

export default function Summary({initialData, initialError, labels}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: accountSummaryDocument,
    initialResult: initialData,
    variables,
    initialError
  })

  if (isLoading) {
    return (
      <LoadingSummary
        labels= {labels}
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
      items={combineByIndex(
        labels,
        {
          1: data.accountsWithBalance?.totalCount,
          2: data.todayAccounts?.totalCount,
          3: data.monthAccounts?.totalCount,
          4: data.last90DaysAccounts?.totalCount,
        }
      )}
    />
  )
}

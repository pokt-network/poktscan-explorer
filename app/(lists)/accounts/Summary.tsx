'use client'

import { accountSummaryDocument } from '@/app/(lists)/accounts/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useCallback } from 'react'
import { getSummaryVariables } from '@/app/(lists)/accounts/utils'
import FourCard from '@/app/components/FourCard'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'
import { LoadingSummary } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

const labels: LabelByIndex = {
  1: "Active Accounts",
  2: "Today Active Accounts",
  3: "30d Active Accounts",
  4: "90d Active Accounts",
}

interface SummaryProps {
  initialData: DocumentNodeData<typeof accountSummaryDocument> | null
  initialError: boolean
}

export default function Summary({initialData, initialError}: SummaryProps) {
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
          1: data?.accountsWithBalance?.totalCount || 0,
          2: data?.todayAccounts?.totalCount || 0,
          3: data?.monthAccounts?.totalCount || 0,
          4: data?.last90DaysAccounts?.totalCount || 0,
        }
      )}
    />
  )
}

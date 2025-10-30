'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { supplierSummaryDocument } from '@/app/(lists)/suppliers/operations'
import { formatAmount } from '@/app/utils/format'
import FourCard from '@/app/components/FourCard'
import React from 'react'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'
import { LoadingSummary } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'

interface SummaryProps {
  initialData: DocumentNodeData<typeof supplierSummaryDocument>
  initialError: boolean
  labels: LabelByIndex
}

export default function Summary({initialData, initialError, labels}: SummaryProps) {
  const { data, error, refetch, isLoading } = useFetchOnBlock({
    query: supplierSummaryDocument,
    initialResult: initialData,
    initialError,
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

  return (
    <FourCard
      items={
        combineByIndex(
          labels,
          {
            1: data?.stakedSuppliers?.totalCount,
            2: formatAmount({
              denom: 'upokt',
              amount: data?.stakedSuppliers?.aggregates?.sum?.stakeAmount
            }),
            3: data?.unstakingSuppliers?.totalCount,
            4: formatAmount({
              denom: 'upokt',
              amount: data?.unstakingSuppliers?.aggregates?.sum?.stakeAmount
            })
          }
        )
      }
    />
  )
}

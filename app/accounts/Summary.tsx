'use client'

import { accountSummaryDocument } from '@/app/accounts/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useCallback } from 'react'
import { getSummaryVariables } from '@/app/accounts/utils'
import FourCard from '@/app/components/FourCard'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'

interface SummaryProps {
  initialData: DocumentNodeData<typeof accountSummaryDocument>
  labels: LabelByIndex
}

export default function Summary({initialData, labels}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const data = useFetchOnBlock({
    query: accountSummaryDocument,
    initialResult: initialData,
    variables
  })

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

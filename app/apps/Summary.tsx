'use client'

import FourCard from '@/app/components/FourCard'
import { formatAmount } from '@/app/utils/format'
import React from 'react'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { applicationSummaryDocument } from '@/app/apps/operations'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'

interface SummaryProps {
  initialData: DocumentNodeData<typeof applicationSummaryDocument>
  labels: LabelByIndex
}

export default function Summary({initialData, labels}: SummaryProps) {
  const data = useFetchOnBlock({
    query: applicationSummaryDocument,
    initialResult: initialData
  })

  return (
    <FourCard
      items={
        combineByIndex(
          labels,
          {
            1: data.stakedApps?.totalCount,
            2: formatAmount({
              denom: 'upokt',
              amount: data.stakedApps?.aggregates?.sum?.stakeAmount
            }),
            3: data.unstakingApps?.totalCount,
            4: formatAmount({
              denom: 'upokt',
              amount: data.unstakingApps?.aggregates?.sum?.stakeAmount
            })
          }
        )
      }
    />
  )
}

'use client'

import FourCard from '@/app/components/FourCard'
import { formatAmount } from '@/app/utils/format'
import React from 'react'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { applicationSummaryDocument } from '@/app/apps/operations'

interface SummaryProps {
  initialData: DocumentNodeData<typeof applicationSummaryDocument>
}

export default function Summary({initialData}: SummaryProps) {
  const data = useFetchOnBlock({
    query: applicationSummaryDocument,
    initialResult: initialData
  })

  return (
    <FourCard
      items={[
        {
          label: 'Staked Applications',
          children: data.stakedApps?.totalCount
        },
        {
          label: 'Staked Tokens',
          children: formatAmount({
            denom: 'upokt',
            amount: data.stakedApps?.aggregates?.sum?.stakeAmount
          })
        },
        {
          label: 'Unstaking Applications',
          children: data.unstakingApps?.totalCount
        },
        {
          label: 'Unstaking Tokens',
          children: formatAmount({
            denom: 'upokt',
            amount: data.unstakingApps?.aggregates?.sum?.stakeAmount
          })
        },
      ]}
    />
  )
}

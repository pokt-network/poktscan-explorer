'use client'

import { accountSummaryDocument } from '@/app/accounts/operations'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import React, { useCallback } from 'react'
import { getSummaryVariables } from '@/app/accounts/utils'
import FourCard from '@/app/components/FourCard'

interface SummaryProps {
  initialData: DocumentNodeData<typeof accountSummaryDocument>
}

export default function Summary({initialData}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const data = useFetchOnBlock({
    query: accountSummaryDocument,
    initialResult: initialData,
    variables
  })

  return (
    <FourCard
      items={[
        {
          label: 'Active Accounts',
          children: data.accountsWithBalance?.totalCount
        },
        {
          label: 'Today Active Accounts',
          children: data.todayAccounts?.totalCount
        },
        {
          label: '30d Active Accounts',
          children: data.monthAccounts?.totalCount
        },
        {
          label: '90d Active Accounts',
          children: data.monthAccounts?.totalCount
        },
      ]}
    />
  )
}

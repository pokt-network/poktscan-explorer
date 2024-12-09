'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { transactionsSummaryDocument } from '@/app/txs/operations'
import FourCard from '@/app/components/FourCard'
import React, { useCallback } from 'react'
import { getSummaryVariables } from '@/app/txs/utils'

interface SummaryProps {
  initialData: DocumentNodeData<typeof transactionsSummaryDocument>
}

export default function Summary({initialData}: SummaryProps) {
  const variables = useCallback((_: number, currentTime: string) => getSummaryVariables(currentTime), [])

  const data = useFetchOnBlock({
    query: transactionsSummaryDocument,
    variables,
    initialResult: initialData
  })

  return (
    <FourCard
      items={[
        {
          label: 'Transactions (24H)',
          children: data.validTxs.totalCount
        },
        {
          label: 'Failed Transactions (24H)',
          children: data.failedTxs.totalCount
        },
        {
          label: 'Total Transactions (24H)',
          children: data.validTxs.totalCount + data.failedTxs.totalCount
        },
        {
          label: 'Transactions (Last Block)',
          children: data.blocks?.nodes?.at(0)?.totalTxs || 0
        },
      ]}
    />
  )
}

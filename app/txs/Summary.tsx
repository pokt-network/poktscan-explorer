'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { transactionsSummaryDocument } from '@/app/txs/operations'
import FourCard from '@/app/components/FourCard'
import React, { useCallback } from 'react'
import { getSummaryVariables, transactionsSummaryLabels } from '@/app/txs/utils'
import { combineByIndex } from '@/app/components/FourCards/utils'

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

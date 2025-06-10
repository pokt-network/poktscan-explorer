'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { supplierSummaryDocument } from '@/app/suppliers/operations'
import { formatAmount } from '@/app/utils/format'
import FourCard from '@/app/components/FourCard'
import React from 'react'
import { combineByIndex, LabelByIndex } from '@/app/components/FourCards/utils'

interface SummaryProps {
  initialData: DocumentNodeData<typeof supplierSummaryDocument>
  labels: LabelByIndex
}

export default function Summary({initialData, labels}: SummaryProps) {
  const data = useFetchOnBlock({
    query: supplierSummaryDocument,
    initialResult: initialData
  })

  return (
    <FourCard
      items={
        combineByIndex(
          labels,
          {
            1: data.stakedSuppliers?.totalCount,
            2: formatAmount({
              denom: 'upokt',
              amount: data.stakedSuppliers?.aggregates?.sum?.stakeAmount
            }),
            3: data.unstakingSuppliers?.totalCount,
            4: formatAmount({
              denom: 'upokt',
              amount: data.unstakingSuppliers?.aggregates?.sum?.stakeAmount
            })
          }
        )
      }
    />
  )
}

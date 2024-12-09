'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { supplierSummaryDocument } from '@/app/suppliers/operations'
import { formatAmount } from '@/app/utils/format'
import FourCard from '@/app/components/FourCard'
import React from 'react'

interface SummaryProps {
  initialData: DocumentNodeData<typeof supplierSummaryDocument>
}

export default function Summary({initialData}: SummaryProps) {
  const data = useFetchOnBlock({
    query: supplierSummaryDocument,
    initialResult: initialData
  })

  return (
    <FourCard
      items={[
        {
          label: 'Staked Suppliers',
          children: data.stakedSuppliers?.totalCount
        },
        {
          label: 'Staked Tokens',
          children: formatAmount({
            denom: 'upokt',
            amount: data.stakedSuppliers?.aggregates?.sum?.stakeAmount
          })
        },
        {
          label: 'Unstaking Suppliers',
          children: data.unstakingSuppliers?.totalCount
        },
        {
          label: 'Unstaking Tokens',
          children: formatAmount({
            denom: 'upokt',
            amount: data.unstakingSuppliers?.aggregates?.sum?.stakeAmount
          })
        },
      ]}
    />
  )
}

'use client'
import { getTransaction } from '@/app/(details)/tx/[id]/getTx'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/tx/[id]/rows'
import { useApolloClient } from '@apollo/client'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import React from 'react'
import { getSourceChipsRow } from '@/app/components/SourceChips'
import EntityNotFound from '@/app/(details)/EntityNotFound'
import { useQuery } from '@tanstack/react-query'

interface TransactionDetailProps {
  hash: string
  rpcUrl: string
}

export default function TransactionDetail({hash, rpcUrl,}: TransactionDetailProps) {
  const client = useApolloClient()

  const {isError, isLoading, data, refetch} = useQuery({
    queryKey: ['tx', hash],
    queryFn: () => getTransaction(hash, rpcUrl, client)
  })

  if (isLoading) {
    return (
      <div className="w-full flex [&_div]:w-full">
        <EntityDetail items={getRows(null, true)} />
      </div>
    )
  } else if (isError) {
    return (
      <div className="h-[162px] w-full flex bg-[color:--main-background] rounded-lg border border-[color:--divider] base-shadow p-4">
        <BaseRetryError onRetry={refetch}/>
      </div>
    )
  } else if (!data) {
    return (
      <EntityNotFound id={hash} />
    )
  }

  return (
    <EntityDetail
      items={[
        ...(data.source ? [getSourceChipsRow(data.source)] : []),
        ...getRows(data.data)
      ]}
    />
  )
}

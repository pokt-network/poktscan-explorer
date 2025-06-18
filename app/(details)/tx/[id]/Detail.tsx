'use client'
import { getTransaction, GetTxResult } from '@/app/(details)/tx/[id]/getTx'
import EntityDetail from '@/app/components/EntityDetail'
import getRows from '@/app/(details)/tx/[id]/rows'
import { useApolloClient } from '@apollo/client'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import React from 'react'
import { getSourceChipsRow } from '@/app/components/SourceChips'

interface TransactionDetailProps extends GetTxResult {
  hash: string
  rpcUrl: string
}

export default function TransactionDetail({hash, rpcUrl, error, source, data,}: TransactionDetailProps) {
  const client = useApolloClient()

  if (error) {
    return (
      <div className="h-[162px] w-full flex">
        <ErrorBoundary
          getProps={async () => {
            const res = await getTransaction(hash, rpcUrl, client)
            return {
              hash,
              rpcUrl,
              ...res,
            }
          }}
          RenderElement={TransactionDetail}
          fallback={
            <EntityDetail items={getRows(null, true)} />
          }
        />
      </div>
    )
  }
  return (
    <EntityDetail
      items={[
        ...(source ? [getSourceChipsRow(source)] : []),
        ...getRows(data)
      ]}
    />
  )
}

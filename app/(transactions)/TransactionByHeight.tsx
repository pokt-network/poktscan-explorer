'use client'

import { gql } from '@apollo/client'
import React, { useCallback } from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { Transaction } from '@/app/config/gql/graphql'
import LoadingListView from '@/app/components/LoadingListView'
import { getTransactionsColumns } from '@/app/(transactions)/columns'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { getTransactionGraphQlFilter, TransactionFilterValues } from '@/app/(transactions)/filters'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

const transactionsByHeightDocument = gql`
  query transactionsByHeight($limit: Int!, $offset: Int!, $filter: TransactionFilter) {
    transactions(
      first: $limit
      offset: $offset
      filter: $filter
      orderBy: BLOCK_ID_DESC
    ) {
      totalCount
      nodes {
        id
        code
        block {
          timestamp
          height: id
        }
        gasUsed
        gasWanted
        signerAddress
        fees
        amountOfMessages
        amountSentByDenom
      }
    }
  }
`

interface TransactionTableProps {
  height: string | bigint | number
  page: number
  itemsPerPage: number
  basePath: string
  filter?: string
}

export default function TransactionByHeightTable({height, page, itemsPerPage, basePath, filter: activeFilter}: TransactionTableProps) {
  const variables = useCallback(() => {
    const filter = getTransactionGraphQlFilter(
      activeFilter as TransactionFilterValues,
      undefined,
      height
    )

    return {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      filter: filter!,
    }
  }, [page, itemsPerPage, height, activeFilter])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: transactionsByHeightDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof transactionsByHeightDocument>,
    initialError: false
  })

  if (isLoading) {
    return (
      <LoadingListView
        columns={getTransactionsColumns(true)}
        rowsAmount={itemsPerPage}
      />
    )
  }

  if (error) {
    return (
      <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the transactions data.'}
        />
      </div>
    )
  }

  const totalPages = Math.ceil((data?.transactions?.totalCount || 0) / itemsPerPage)

  return (
    <TransactionTable
      rawRows={(data?.transactions?.nodes || []) as Array<Transaction>}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath
      }}
      totalItems={data?.transactions?.totalCount || 0}
      includeSigner={true}
      activeFilter={activeFilter}
      csvEndpoint={`/api/export/txs?height=${height}`}
    />
  )
}

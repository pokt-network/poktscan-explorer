import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { Transaction } from '@/app/config/gql/graphql'
import LoadingListView from '@/app/components/LoadingListView'
import { getTransactionsColumns } from '@/app/(transactions)/columns'
import { RefreshPageError } from '@/app/components/ErrorBoundary'
import { getTransactionGraphQlFilter, TransactionFilterValues } from '@/app/(transactions)/filters'

const transactionsByHeightDocument = graphql(`
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
`)

interface TransactionTableProps {
  height: string | bigint | number
  page: number
  itemsPerPage: number
  basePath: string
  filter?: string
}

async function ServerTransactionByHeightTable({height, page, itemsPerPage, basePath, filter: activeFilter}: TransactionTableProps) {
  try {
    const filter = getTransactionGraphQlFilter(
      activeFilter as TransactionFilterValues,
      undefined,
      height
    )

    let { data } = await getClient().query({
      query: transactionsByHeightDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        filter: filter!,
      }
    })

    const totalPages = Math.ceil((data.transactions?.totalCount || 0) / itemsPerPage)

    if (page > totalPages && totalPages > 0) {
      page = 1

      const result = await getClient().query({
        query: transactionsByHeightDocument,
        variables: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          filter: filter!,
        }
      })

      data = result.data
    }

    return (
      <TransactionTable
        rawRows={(data?.transactions?.nodes || []) as Array<Transaction>}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath
        }}
        totalItems={data.transactions?.totalCount || 0}
        includeSigner={true}
        disableSubscription={true}
        activeFilter={activeFilter}
        csvEndpoint={`/api/export/txs?height=${height}`}
      />
    )
  } catch {
    return (
      <RefreshPageError />
    )
  }
}

export default async function TransactionByAddressTable(props: TransactionTableProps) {
  return (
    <Suspense
      key={`transactions-by-height-${props.height}-${props.page}-${props.itemsPerPage}-${new Date().toISOString()}`}
      fallback={
        <LoadingListView
          columns={getTransactionsColumns(true)}
          rowsAmount={props.itemsPerPage}
        />
      }
    >
      <ServerTransactionByHeightTable {...props} />
    </Suspense>
  )
}

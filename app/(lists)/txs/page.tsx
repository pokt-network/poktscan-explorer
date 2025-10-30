import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { getLatestBlock } from '@/app/api/blocks'
import ListTitle from '@/app/components/ListTitle'
import { transactionsPageDocument, transactionsSummaryDocument } from '@/app/(lists)/txs/operations'
import Summary from '@/app/(lists)/txs/Summary'
import { LoadingSummary, LoadingTable } from '@/app/components/LoadingListView'
import { getTransactionsColumns } from '@/app/(transactions)/columns'
import { transactionsSummaryLabels } from '@/app/(lists)/txs/utils'
import { RefreshPageError } from '@/app/components/ErrorBoundary'
import { getTransactionGraphQlFilter, TransactionFilterValues } from '@/app/(transactions)/filters'
import { TransactionFilter } from '../../config/gql/graphql'

export const dynamic = "force-dynamic";

async function TransactionsSummary() {
  let data, error = false

  try {
    const latestBlock = await getLatestBlock()

    const currentDate = new Date(latestBlock.timestamp)
    const startDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))

    const response = await getClient().query({
      query: transactionsSummaryDocument,
      variables: {
        startDate: startDate.toISOString(),
        endDate: currentDate.toISOString()
      }
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <Summary initialData={data} initialError={error} />
  )
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerTransactionsPage({searchParams}: PageProps) {
  try {
    const [pageInfo, awaitedSearchParams] = await Promise.all([
      getPageAndItems(searchParams),
      searchParams
    ])
    let page = pageInfo.page
    const itemsPerPage = pageInfo.itemsPerPage

    const client = getClient()

    const activeFilter = awaitedSearchParams?.['filter']

    let filter: TransactionFilter | undefined = undefined

    if (typeof activeFilter === 'string') {
      filter = getTransactionGraphQlFilter(activeFilter as TransactionFilterValues) || undefined
    }

    // eslint-disable-next-line prefer-const
    let { data } = await client.query({
      query: transactionsPageDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        filter,
      }
    })

    const totalPages = Math.ceil((data.transactions?.totalCount || 0) / itemsPerPage)

    if (page > totalPages) {
      page = 1

      const result = await client.query({
        query: transactionsPageDocument,
        variables: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          filter,
        }
      })

      data = result.data
    }

    return (
      <TransactionTable
        rawRows={data.transactions?.nodes || []}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath: '/txs'
        }}
        totalItems={data.transactions?.totalCount}
        activeFilter={typeof activeFilter === 'string' ? activeFilter : undefined}
        csvEndpoint="/api/export/txs"
      />
    )
  } catch {
    return (
      <RefreshPageError />
    )
  }
}

export default async function TransactionsPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Transactions'} />
      <Suspense
        key={`transactions-summary`}
        fallback={
          <LoadingSummary
            labels= {transactionsSummaryLabels}
          />
        }
      >
        <TransactionsSummary />
      </Suspense>
      <Suspense
        key={`transactions-page-${pageInfo.page}-${pageInfo.itemsPerPage}-${new Date().toISOString()}`}
        fallback={
          <LoadingTable
            columns={getTransactionsColumns()}
            rowsAmount={pageInfo.itemsPerPage}
          />
        }
      >
        <ServerTransactionsPage searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

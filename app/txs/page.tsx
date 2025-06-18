import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { getLatestBlock } from '@/app/api/blocks'
import ListTitle from '@/app/components/ListTitle'
import { transactionsPageDocument, transactionsSummaryDocument } from '@/app/txs/operations'
import Summary from '@/app/txs/Summary'
import { LoadingSummary, LoadingTable } from '@/app/components/LoadingListView'
import { getTransactionsColumns } from '@/app/(transactions)/columns'
import { transactionsSummaryLabels } from '@/app/txs/utils'

export const dynamic = "force-dynamic";

async function TransactionsSummary() {
  const latestBlock = await getLatestBlock()

  const currentDate = new Date(latestBlock.timestamp)
  const startDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))

  const {data: summaryData} = await getClient().query({
    query: transactionsSummaryDocument,
    variables: {
      startDate: startDate.toISOString(),
      endDate: currentDate.toISOString()
    }
  })

  return (
    <Summary initialData={summaryData} />
  )
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerTransactionsPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)
  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage


  const client = getClient()

  // eslint-disable-next-line prefer-const
  let { data } = await client.query({
    query: transactionsPageDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
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
    />
  )
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
        key={`transactions-page-${pageInfo.page}-${pageInfo.itemsPerPage}`}
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

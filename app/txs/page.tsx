import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { getLatestBlock } from '@/app/api/blocks'
import ListTitle from '@/app/components/ListTitle'
import { transactionsPageDocument, transactionsSummaryDocument } from '@/app/txs/operations'
import Summary from '@/app/txs/Summary'

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TransactionsPage({searchParams}: PageProps) {
  const [pageInfo, latestBlock] = await Promise.all([
    getPageAndItems(searchParams),
    getLatestBlock()
  ])
  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage

  const currentDate = new Date(latestBlock.timestamp)
  const startDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))

  const client = getClient()

  // eslint-disable-next-line prefer-const
  let [{ data }, {data: summaryData}] = await Promise.all([
    client.query({
      query: transactionsPageDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        startDate: startDate.toISOString(),
        endDate: currentDate.toISOString()
      }
    }),
    client.query({
      query: transactionsSummaryDocument,
      variables: {
        startDate: startDate.toISOString(),
        endDate: currentDate.toISOString()
      }
    })
  ])

  const totalPages = Math.ceil((data.transactions?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await client.query({
      query: transactionsPageDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        startDate: startDate.toISOString(),
        endDate: currentDate.toISOString()
      }
    })

    data = result.data
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Transactions'} />
      <Summary initialData={summaryData} />
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
    </div>
  )
}

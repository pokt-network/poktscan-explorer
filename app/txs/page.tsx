import { graphql } from '@/app/config/gql'
import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import FourCard from '@/app/components/FourCard'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { getLatestBlock } from '@/app/api/blocks'
import ListTitle from '@/app/components/ListTitle'

export const dynamic = "force-dynamic";

const transactionsPageDocument = graphql(`
  query transactions($limit: Int!, $offset: Int!, $startDate: Datetime!, $endDate: Datetime!) {
    transactions(
      first: $limit, 
      offset: $offset,
      orderBy: BLOCK_BY_BLOCK_ID__HEIGHT_DESC
    ) {
      totalCount
      nodes {
        id
        code
        block {
          timestamp
          height
        }
        gasUsed
        gasWanted
        signerAddress
        fees
        messages {
          nodes {
            typeUrl
            json
          }
        }
      }
    }
    validTxs: transactions(
      filter: {
        code: { equalTo: 0 }
        block: { timestamp: { greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate} }
      }
    ) {
      totalCount
    }
    failedTxs: transactions(
      filter: {
        code: { notEqualTo: 0 }
        block: { timestamp: { greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate} }
      }
    ) {
      totalCount
    }
  }
`)

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

  let { data } = await getClient().query({
    query: transactionsPageDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      startDate: startDate.toISOString(),
      endDate: currentDate.toISOString()
    }
  })

  const totalPages = Math.ceil((data.transactions?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
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
      <FourCard
        items={[
          {
            label: 'Transactions (24H)',
            children: data.validTxs.totalCount
          },
          {
            label: 'Failed Transactions (24H)',
            children: data.failedTxs.totalCount
          },
          {
            label: 'Total Transactions (24H)',
            children: data.validTxs.totalCount + data.failedTxs.totalCount
          },
          {
            label: 'Transactions (Last Block)',
            children: latestBlock.totalTxs
          },

        ]}
      />

      <TransactionTable
        rawRows={data.transactions?.nodes}
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

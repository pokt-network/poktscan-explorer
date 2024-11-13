import { graphql } from '@/app/config/gql'
import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import FourCard from '@/app/components/FourCard'
import TransactionTable from '@/app/(transactions)/TransactionTable'

const transactionsPageDocument = graphql(`
  query transactions($limit: Int!, $offset: Int!, $startDate: Datetime!, $endDate: Datetime!) {
    transactions(first: $limit, offset: $offset, orderBy: BLOCK_ID_DESC) {
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
    latestBlock: blocks(first: 1, orderBy: HEIGHT_DESC) {
      nodes {
        height
        txAmount
      }
    }
  }
`)

interface RowTransaction {
  id: string
  result: 0 | 1
  messages: Array<string>
  height: number
  timestamp: string
  amount: string
  fee: string
  signer: string
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TransactionsPage({searchParams}: PageProps) {
  let { page, itemsPerPage } = await getPageAndItems(searchParams)

  const startDate = new Date(Date.now() - (24 * 60 * 60 * 1000))
  const endDate = new Date()

  let { data } = await getClient().query({
    query: transactionsPageDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  })

  const totalPages = Math.ceil((data.transactions?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
      query: transactionsPageDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
    })

    data = result.data
  }

  return (
    <div className={"p-10 gap-5 flex flex-col"}>
      <h1 className={'text-2xl font-semibold'}>
        Transactions
      </h1>
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
            children: data.latestBlock.nodes[0].txAmount
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
      />
    </div>
  )
}

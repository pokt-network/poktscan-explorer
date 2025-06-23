import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import React, { Suspense } from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { Transaction } from '@/app/config/gql/graphql'
import NewTransactionsByAddress from '@/app/(transactions)/NewTransactionsByAddress'
import LoadingListView from '@/app/components/LoadingListView'
import { getTransactionsColumns } from '@/app/(transactions)/columns'

const transactionsByAddressDocument = graphql(`
  query transactionsByAddress($limit: Int!, $offset: Int!, $address: String!) {
    transactions(
      first: $limit
      offset: $offset
      filter: {
        or: [
          {
            signerAddress: { equalTo: $address },
          }
        ]
      }
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
  address: string
  page: number
  itemsPerPage: number
  basePath: string
}

async function ServerTransactionByAddressTable({address, page, itemsPerPage, basePath}: TransactionTableProps) {
  let { data } = await getClient().query({
    query: transactionsByAddressDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      address,
    }
  })

  const totalPages = Math.ceil((data.transactions?.totalCount || 0) / itemsPerPage)

  if (page > totalPages && totalPages > 0) {
    page = 1

    const result = await getClient().query({
      query: transactionsByAddressDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        address,
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
      subtitle={(
        <NewTransactionsByAddress address={address} />
      )}
    />
  )
}

export default async function TransactionByAddressTable(props: TransactionTableProps) {
  return (
    <Suspense
      key={`transactions-by-address-${props.address}-${props.page}-${props.itemsPerPage}`}
      fallback={
        <LoadingListView
          columns={getTransactionsColumns(true)}
          rowsAmount={props.itemsPerPage}
        />
      }
    >
      <ServerTransactionByAddressTable {...props} />
    </Suspense>
  )
}

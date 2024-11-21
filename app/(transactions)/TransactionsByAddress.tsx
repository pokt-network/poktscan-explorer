import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import { Transaction } from '@/app/config/gql/graphql'

const transactionsByAddressDocument = graphql(`
  query transactionsByAddress($limit: Int!, $offset: Int!, $address: String!) {
    transactions(
      first: $limit
      offset: $offset
      filter: {
        or: [
          {
            signerAddress: { equalTo: $address },
          },
          {
            messages: { some: {json: {includesInsensitive: $address}}}
          }
        ]
      }
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
  }
`)

interface TransactionTableProps {
  address: string
  page: number
  itemsPerPage: number
  basePath: string
}

export default async function TransactionByAddressTable({address, page, itemsPerPage, basePath}: TransactionTableProps) {
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
    />
  )
}

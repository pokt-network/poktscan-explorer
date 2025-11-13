'use client'

import React, { useCallback, useMemo } from 'react'
import TransactionTable from '@/app/(transactions)/TransactionTable'
import ListTitle from '@/app/components/ListTitle'
import { transactionsPageDocument } from '@/app/(lists)/txs/operations'
import Summary from '@/app/(lists)/txs/Summary'
import { LoadingTable } from '@/app/components/LoadingListView'
import { getTransactionsColumns } from '@/app/(transactions)/columns'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { getTransactionGraphQlFilter, TransactionFilterValues } from '@/app/(transactions)/filters'
import { useSearchParams } from 'next/navigation'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

function TransactionsTable() {
  const searchParams = useSearchParams()

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const filterParam = searchParams.get('filter')

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  const filter = useMemo(() => {
    if (typeof filterParam === 'string') {
      return getTransactionGraphQlFilter(filterParam as TransactionFilterValues) || undefined
    }
    return undefined
  }, [filterParam])

  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
    filter,
  }), [page, itemsPerPage, filter])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: transactionsPageDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof transactionsPageDocument>,
    initialError: false
  })

  if (isLoading) {
    return (
      <LoadingTable
        columns={getTransactionsColumns()}
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
      rawRows={data?.transactions?.nodes || []}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath: '/txs'
      }}
      totalItems={data?.transactions?.totalCount}
      activeFilter={typeof filterParam === 'string' ? filterParam : undefined}
      csvEndpoint="/api/export/txs"
    />
  )
}

export default function TransactionsPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Transactions'} />
      <Summary
        initialData={null as any}
        initialError={false}
      />
      <TransactionsTable />
    </div>
  )
}

'use client'

import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { useCallback } from 'react'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import ListTitle from '@/app/components/ListTitle'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { accountListDocument } from '@/app/(lists)/accounts/operations'
import Summary from '@/app/(lists)/accounts/Summary'
import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import { LoadingTable } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { useSearchParams } from 'next/navigation'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Address',
    renderCell: (cell: RowAccount) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'account'}
          entityId={cell.id}
        />
      </div>
    )
  },
  {
    field: 'lastUpdatedBlock',
    headerName: 'Updated Height',
    renderCell: (cell: RowAccount) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'block'}
          entityId={cell.lastUpdatedBlock}
        />
      </div>
    )
  },
  {
    field: 'lastUpdatedTime',
    headerName: <DateColumn />,
    align: 'center',
    width: 180,
    renderCell: (row: RowAccount) => (
      <div className={'text-xs md:text-sm'}>
        {row.lastUpdatedTime ? (<DateCellText value={row.lastUpdatedTime} />) : ''}
      </div>
    )
  },
  {
    field: 'balance',
    headerName: 'Balance',
    align: 'right',
  },
]

const accountSubscription = graphql(`
  subscription accounts {
    accounts {
      id
    }
  }
`)

interface RowAccount {
  id: string
  lastUpdatedBlock: string
  lastUpdatedTime: string
  balance: string
}

function AccountsTable() {
  const searchParams = useSearchParams()

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
  }), [page, itemsPerPage])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: accountListDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof accountListDocument>,
    initialError: false
  })

  if (isLoading) {
    return (
      <LoadingTable
        columns={columns}
        rowsAmount={itemsPerPage}
      />
    )
  }

  if (error) {
    return (
      <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the accounts data.'}
        />
      </div>
    )
  }

  const rows: Array<RowAccount> = data?.balances?.nodes?.map((balance) => {
    return {
      id: balance?.accountId || '',
      balance: formatAmount({
        amount: balance?.amount ||'0',
        denom: balance?.denom || 'upokt'
      }),
      raw_balance: convertUpoktToPokt(balance?.amount),
      lastUpdatedBlock: balance?.lastUpdatedBlock?.height,
      lastUpdatedTime: balance?.lastUpdatedBlock?.timestamp,
    } as RowAccount
  }) || []

  const totalPages = Math.ceil((data?.balances?.totalCount || 0) / itemsPerPage)

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data?.balances?.totalCount} accounts found`,
        subtitle: (
          <NewEntitiesFound<typeof accountSubscription>
            subscription={accountSubscription}
            entity={'accounts'}
          />
        )
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage: itemsPerPage,
        basePath: '/accounts'
      }}
      csvEndpoint="/api/export/accounts"
    />
  )
}

export default function AccountsPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Accounts'} />
      <Summary initialData={null} initialError={false} />
      <AccountsTable />
    </div>
  )
}

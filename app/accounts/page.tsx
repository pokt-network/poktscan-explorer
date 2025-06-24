import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { Suspense } from 'react'
import { getLatestBlock } from '@/app/api/blocks'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import ListTitle from '@/app/components/ListTitle'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { accountListDocument, accountSummaryDocument } from '@/app/accounts/operations'
import { getSummaryVariables } from '@/app/accounts/utils'
import Summary from '@/app/accounts/Summary'
import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import { LabelByIndex } from '@/app/components/FourCards/utils'
import { LoadingSummary, LoadingTable } from '@/app/components/LoadingListView'
import { RefreshPageError } from '@/app/components/ErrorBoundary'

export const dynamic = "force-dynamic";

const summaryLabelsByIndex: LabelByIndex = {
  1: "Active Accounts",
  2: "Today Active Accounts",
  3: "30d Active Accounts",
  4: "90d Active Accounts",
}

async function AccountsSummary() {
  let data, error = false

  try {
    const latestBlock = await getLatestBlock()

    const response = await getClient().query({
      query: accountSummaryDocument,
      variables: getSummaryVariables(latestBlock.timestamp)
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <Summary initialData={data} initialError={error} labels={summaryLabelsByIndex} />
  )
}

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
        <DateCellText value={row.lastUpdatedTime} />
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

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function AccountsTable({searchParams}: PageProps) {
  try {
    const pageInfo = await getPageAndItems(searchParams)

    let page = pageInfo.page
    const itemsPerPage = pageInfo.itemsPerPage

    const client = getClient()

    // eslint-disable-next-line prefer-const
    let {data} = await client.query({
      query: accountListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      }
    })

    const totalPages = Math.ceil((data.balances?.totalCount || 0) / itemsPerPage)

    if (page > totalPages) {
      page = 1

      const result = await client.query({
        query: accountListDocument,
        variables: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
        }
      })

      data = result.data
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

    return (
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.balances?.totalCount} accounts found`,
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
          itemsPerPage,
          basePath: '/accounts'
        }}
      />
    )
  } catch {
    return (
      <RefreshPageError />
    )
  }
}

export default async function AccountsPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Accounts'} />
      <Suspense
        key={`accounts-summary`}
        fallback={
          <LoadingSummary labels={summaryLabelsByIndex} />
        }
      >
        <AccountsSummary />
      </Suspense>
      <Suspense
        key={`accounts-page-${pageInfo.page}-${pageInfo.itemsPerPage}-${new Date().toISOString()}`}
        fallback={
          <LoadingTable
            columns={columns}
            rowsAmount={pageInfo.itemsPerPage}
          />
        }
      >
        <AccountsTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

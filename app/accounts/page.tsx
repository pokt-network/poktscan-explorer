import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
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

export const dynamic = "force-dynamic";

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

export default async function AccountsPage({searchParams}: PageProps) {
  const [pageInfo, latestBlock] = await Promise.all([
    getPageAndItems(searchParams),
    getLatestBlock()
  ])
  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage

  const client = getClient()

  // eslint-disable-next-line prefer-const
  let [{data}, {data: summaryData}] = await Promise.all([
    client.query({
      query: accountListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      }
    }),
    client.query({
      query: accountSummaryDocument,
      variables: getSummaryVariables(latestBlock.timestamp)
    })
  ])

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
        <DateCellText value={row.lastUpdatedTime} />
      )
    },
    {
      field: 'balance',
      headerName: 'Balance',
      align: 'right',
    },
  ]

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Accounts'} />
      <Summary initialData={summaryData} />
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
    </div>
  )
}

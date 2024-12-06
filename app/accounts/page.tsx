import { graphql } from '@/app/config/gql'
import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import FourCard from '@/app/components/FourCard'
import { getLatestBlock } from '@/app/api/blocks'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import ListTitle from '@/app/components/ListTitle'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'

export const dynamic = "force-dynamic";

const accountListDocument = graphql(`
  query accountList($limit: Int!, $offset: Int!, $todayDate: Datetime!, $monthDate: Datetime!, $last90Date: Datetime!) {
    balances (
      first: $limit,
      offset: $offset,
      orderBy: AMOUNT_DESC
      filter: {denom: {equalTo: "upokt"}}
    ) {
      totalCount
      nodes {
        amount
        denom
        accountId
        lastUpdatedBlock {
          height
          timestamp
        }
      }
    }
    accountsWithBalance: balances(filter: {amount: {greaterThan: "0"}}) {
      totalCount
    }
    todayAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $todayDate}}, denom: {equalTo: "upokt"}}) {
      totalCount
    }
    monthAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $monthDate}}, denom: {equalTo: "upokt"}}) {
      totalCount
    }
    last90DaysAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $last90Date}}, denom: {equalTo: "upokt"}}) {
      totalCount
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

  const todayDate = new Date(latestBlock.timestamp)
  todayDate.setHours(0, 0, 0, 0)

  const monthDate = new Date(latestBlock.timestamp)
  monthDate.setMonth(monthDate.getMonth() - 1)

  const last90Date = new Date(latestBlock.timestamp)
  last90Date.setMonth(last90Date.getMonth() - 3)

  let {data} = await getClient().query({
    query: accountListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      todayDate: todayDate.toISOString(),
      monthDate: monthDate.toISOString(),
      last90Date: last90Date.toISOString()
    }
  })

  const totalPages = Math.ceil((data.balances?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
      query: accountListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        todayDate: todayDate.toISOString(),
        monthDate: monthDate.toISOString(),
        last90Date: last90Date.toISOString()
      }
    })

    data = result.data
  }

  const rows: Array<RowAccount> = data?.balances?.nodes?.map((balance) => {
    return {
      id: balance?.accountId || '',
      balance: formatAmount(balance || {
        amount: '0',
        denom: 'upokt'
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
      <FourCard
        items={[
          {
            label: 'Active Accounts',
            children: data.accountsWithBalance?.totalCount
          },
          {
            label: 'Today Active Accounts',
            children: data.todayAccounts?.totalCount
          },
          {
            label: '30d Active Accounts',
            children: data.monthAccounts?.totalCount
          },
          {
            label: '90d Active Accounts',
            children: data.monthAccounts?.totalCount
          },
        ]}
      />
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.balances?.totalCount} accounts found`,
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

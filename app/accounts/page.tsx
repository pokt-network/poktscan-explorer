import { graphql } from '@/app/config/gql'
import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import FourCard from '@/app/components/FourCard'
import { getLatestBlock } from '@/app/api/blocks'
import { formatAmount } from '@/app/utils/format'

export const dynamic = "force-dynamic";

const accountListDocument = graphql(`
  query accountList($limit: Int!, $offset: Int!, $todayDate: Datetime!, $monthDate: Datetime!, $last90Date: Datetime!) {
    accounts(first: $limit, offset: $offset, orderBy: BALANCES_SUM_AMOUNT_DESC) {
      totalCount
      nodes {
        id
        balances {
          nodes {
            amount
            denom
            lastUpdatedBlock {
              height
              timestamp
            }
          }
        }
      }
    }
    accountsWithBalance: accounts(filter: {balances: {some: {amount: {greaterThan: "0"}}}}) {
      totalCount
    }
    todayAccounts: accounts(filter: {balances: {some: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $todayDate}}}}}) {
      totalCount
    }
    monthAccounts: accounts(filter: {balances: {some: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $monthDate}}}}}) {
      totalCount
    }
    last90DaysAccounts: accounts(filter: {balances: {some: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $last90Date}}}}}) {
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

  const totalPages = Math.ceil((data.accounts?.totalCount || 0) / itemsPerPage)

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

  const rows: Array<RowAccount> = data?.accounts?.nodes?.map((account) => {
    const upoktBalance = account?.balances?.nodes?.find((item) => item?.denom === 'upokt')

    return {
      id: account?.id || '',
      balance: formatAmount(upoktBalance || {
        amount: '0',
        denom: 'upokt'
      }),
      lastUpdatedBlock: upoktBalance?.lastUpdatedBlock?.height,
      lastUpdatedTime: upoktBalance?.lastUpdatedBlock?.timestamp,
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
      field: 'balance',
      headerName: 'Balance',
    },
    {
      field: 'lastUpdatedTime',
      headerName: 'Updated Date',
      maxWidth: 180,
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
  ]

  return (
    <div className={"px-3 py-10 md:px-10 gap-5 flex flex-col"}>
      <h1 className={'text-2xl font-semibold'}>
        Accounts
      </h1>
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
          title: `${data.accounts?.totalCount} accounts found`,
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

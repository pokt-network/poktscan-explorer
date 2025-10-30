import { graphql } from '@/app/config/gql'
import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { Suspense } from 'react'
import { getStakeLabel } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import ListTitle from '@/app/components/ListTitle'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import { RowTransaction } from '@/app/(transactions)/TransactionTable'
import LoadingListView from '@/app/components/LoadingListView'
import { RefreshPageError } from '@/app/components/ErrorBoundary'

export const dynamic = "force-dynamic";

const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Address',
    maxWidth: 200,
    renderCell: (row: RowValidator) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'validator'}
          entityId={row.id}
        />
      </div>
    )
  },
  {
    description: 'Address of the Validator signer',
    field: 'signer',
    headerName: 'Signer',
    maxWidth: 190,
    renderCell: (cell: RowTransaction) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'account'}
          entityId={cell.signer}
          copy={{
            enabled: true
          }}
        />
      </div>
    )
  },
  {
    field: 'moniker',
    headerName: 'Moniker',
  },
  {
    field: 'status',
    headerName: 'Status',
  },
  {
    field: 'stakeAmount',
    headerName: 'Stake Amount',
    align: 'right',
  },
  {
    field: 'minSelfDelegation',
    headerName: 'Self Delegation',
    align: 'right',
  },
  {
    field: 'commissionRate',
    headerName: 'Commission',
    align: 'right',
    renderCell: (cell: RowValidator) => (
      <p className={"text-xs"}>
        {formatAmount({
          amount: cell.commissionRate * 100,
          denom: '%',
          maxDecimals: 2,
        })}
      </p>
    ),
  },
  {
    field: 'commissionMaxRate',
    headerName: 'Max. Commission',
    align: 'right',
    renderCell: (cell: RowValidator) => (
      <p className={"text-xs"}>
        {formatAmount({
          amount: cell.commissionMaxRate * 100,
          denom: '%',
          maxDecimals: 2,
        })}
      </p>
    ),
  },
]

const validatorsSubscription = graphql(`
  subscription validators {
    validators {
      id
    }
  }
`)

const validatorsListDocument = graphql(`
  query validatorsList($limit: Int!, $offset: Int!) {
    validators(first: $limit, offset: $offset) {
      totalCount
      nodes {
        id
        id
        signerId
        description
        commission
        minSelfDelegation
        stakeDenom
        stakeAmount
        stakeStatus
        signer {
          id
        }
      }
    }
  }
`)

interface RowValidator {
  id: string
  moniker: string
  status: string
  stakeAmount: string
  minSelfDelegation: string
  commissionRate: number
  commissionMaxRate: number
  commissionMaxChangeRate: number
  signer: string
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerValidatorsPage({searchParams}: PageProps) {
  try {
    const pageInfo = await getPageAndItems(searchParams)
    let page = pageInfo.page
    const itemsPerPage = pageInfo.itemsPerPage

    let {data} = await getClient().query({
      query: validatorsListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
    })

    const totalPages = Math.ceil((data.validators?.totalCount || 0) / itemsPerPage)

    if (page > totalPages) {
      page = 1

      const result = await getClient().query({
        query: validatorsListDocument,
        variables: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage
        }
      })

      data = result.data
    }

    const rows: Array<RowValidator> = data.validators?.nodes?.map((validator) => {
      return {
        id: validator?.id,
        status: getStakeLabel(validator?.stakeStatus as number),
        stakeAmount: formatAmount({
          amount: validator?.stakeAmount,
          denom: validator?.stakeDenom,
        }),
        raw_stakeAmount: convertUpoktToPokt(validator?.stakeAmount),
        moniker: validator?.description?.moniker,
        minSelfDelegation: validator?.minSelfDelegation,
        commissionRate: Number(validator?.commission.rate),
        commissionMaxRate: Number(validator?.commission.maxRate),
        commissionMaxChangeRate: Number(validator?.commission.maxChangeRate),
        signer: validator?.signer?.id || '',
      }
    })

    return (
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.validators?.totalCount} validators found`,
          subtitle: (
            <NewEntitiesFound<typeof validatorsSubscription>
              subscription={validatorsSubscription}
              entity={'validators'}
            />
          )
        }}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath: '/validators'
        }}
        defaultMinWidth={70}
        csvEndpoint="/api/export/validators"
      />
    )
  } catch {
    return (
      <RefreshPageError />
    )
  }
}

export default async function ValidatorsPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Validators'} />
      <Suspense
        key={`validators-page-${pageInfo.page}-${pageInfo.itemsPerPage}-${new Date().toISOString()}`}
        fallback={
          <LoadingListView
            columns={columns}
            rowsAmount={pageInfo.itemsPerPage}
          />
        }
      >
        <ServerValidatorsPage searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

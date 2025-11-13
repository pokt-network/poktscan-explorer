'use client'

import { graphql } from '@/app/config/gql'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { useCallback } from 'react'
import { getStakeLabel } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import ListTitle from '@/app/components/ListTitle'
import { RowTransaction } from '@/app/(transactions)/TransactionTable'
import { LoadingTable } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { useSearchParams } from 'next/navigation'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { StakeStatus } from '@/app/config/gql/graphql'

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

function ValidatorsTable() {
  const searchParams = useSearchParams()

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 50

  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
  }), [page, itemsPerPage])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: validatorsListDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof validatorsListDocument>,
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
          errorMessage={'Oops. There was an error loading the validators data.'}
        />
      </div>
    )
  }

  const rows: Array<RowValidator> = data?.validators?.nodes?.map((validator) => {
    return {
      id: validator?.id || '',
      stakeAmount: formatAmount({
        amount: validator?.stakeAmount || '0',
        denom: validator?.stakeDenom || 'upokt',
      }),
      status: getStakeLabel(validator?.stakeStatus || StakeStatus.Unstaked),
      raw_stakeAmount: convertUpoktToPokt(validator?.stakeAmount || 0),
      moniker: validator?.description?.moniker || '',
      minSelfDelegation: (validator?.minSelfDelegation || 0).toString(),
      commissionRate: Number(validator?.commission?.rate),
      commissionMaxRate: Number(validator?.commission?.maxRate),
      commissionMaxChangeRate: Number(validator?.commission?.maxChangeRate),
      signer: validator?.signer?.id || '',
    }
  }) || []

  const totalPages = Math.ceil((data?.validators?.totalCount || 0) / itemsPerPage)

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data?.validators?.totalCount} validators found`,
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
}

export default function ValidatorsPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Validators'} />
      <ValidatorsTable />
    </div>
  )
}

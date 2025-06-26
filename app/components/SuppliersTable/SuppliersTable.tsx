import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { StakeStatus } from '@/app/config/gql/graphql'
import { getStakeLabel } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { ChipText } from '@/app/components/Chip'
import { supplierListDocument, } from '@/app/suppliers/operations'
import SuppliersSubscription from '@/app/components/SuppliersTable/SuppliersSubscription'
import { RefreshPageError } from '@/app/components/ErrorBoundary'

export const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Address',
    minWidth: 200,
    renderCell: (cell: RowSupplier) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'supplier'}
          entityId={cell.id}
        />
      </div>
    )
  },
  {
    field: 'status',
    headerName: 'Status',
  },
  {
    field: 'stakeType',
    headerName: 'Stake Type',
  },
  {
    field: 'stakeAmount',
    headerName: 'Stake Amount',
    align: 'right',
  },
  {
    field: 'balance',
    headerName: 'Balance',
    align: 'right',
  },
  {
    field: "outputAddress",
    headerName: "Output Address",
    renderCell: (cell: RowSupplier) => cell.outputAddress === '-' ? '-' : (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'account'}
          entityId={cell.outputAddress}
        />
      </div>
    )
  },
  {
    field: 'outputBalance',
    headerName: 'Output Balance',
    align: 'right',
  },
  {
    field: 'services',
    headerName: 'Services',
    renderCell: (cell: RowSupplier) => (
      // eslint-disable-next-line react/no-children-prop
      <ChipText children={cell.firstService} moreElements={cell.amountOfServices - 1} />
    )
  }
]

interface RowSupplier {
  id: string
  status: string
  stakeType: string
  stakeAmount: string
  balance: string
  outputAddress: string
  outputBalance: string
  firstService: string
  amountOfServices: number
}

interface PageProps {
  page: number
  itemsPerPage: number
  basePath: string
  service?: string
  owners?: Array<string>
}

export default async function SuppliersTable({page, itemsPerPage, basePath, service, owners}: PageProps) {
  try {
    const client = getClient()

    const filter = service ? {
      serviceConfigs: {
        some: {
          serviceId: {
            equalTo: service
          }
        }
      }
    } : owners ? {
      ownerId: {
        in: owners
      }
    } : undefined

    // eslint-disable-next-line prefer-const
    let {data} = await client.query({
      query: supplierListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        filter
      }
    })

    const totalPages = Math.ceil((data.suppliers?.totalCount || 0) / itemsPerPage)

    if (page > totalPages) {
      page = 1

      const result = await client.query({
        query: supplierListDocument,
        variables: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          filter
        }
      })

      data = result.data
    }

    const rows: Array<RowSupplier> = data.suppliers?.nodes?.map((supplier) => {
      const isCustodian = supplier!.stakeStatus === StakeStatus.Staked && supplier!.operatorId === supplier!.ownerId
      const balance =supplier!.operator?.balances?.nodes?.at(0) || {
        amount: 0,
        denom: 'upokt'
      }
      const outputBalance = supplier!.owner?.balances?.nodes?.at(0) || {
        amount: 0,
        denom: 'upokt'
      }

      return {
        id: supplier!.id,
        status: getStakeLabel(supplier!.stakeStatus),
        stakeType: supplier!.stakeStatus === StakeStatus.Staked ? isCustodian ? "Custodian" : "Non-Custodian" : "-",
        stakeAmount: formatAmount({
          amount: supplier!.stakeAmount,
          denom: supplier!.stakeDenom
        }),
        raw_stakeAmount: convertUpoktToPokt(supplier!.stakeAmount),
        balance: formatAmount(balance),
        raw_balance: convertUpoktToPokt(balance?.amount),
        outputBalance: isCustodian ? '-' : formatAmount(outputBalance),
        raw_outputBalance: isCustodian ? '' : formatAmount(outputBalance),
        outputAddress: isCustodian ? '-' : supplier!.ownerId,
        amountOfServices: supplier!.supplierServices.totalCount,
        firstService: supplier!.supplierServices.nodes[0]?.serviceId,
      }
    })

    return (
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.suppliers?.totalCount} suppliers found`,
          subtitle: <SuppliersSubscription service={service} owners={owners} />
        }}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath,
        }}
        defaultMinWidth={70}
      />
    )
  } catch {
    return (
      <RefreshPageError />
    )
  }
}

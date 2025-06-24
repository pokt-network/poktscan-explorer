import { getClient } from '@/app/config/apollo/rsc'
import { getStakeLabel } from '@/app/utils/stake'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { ChipText } from '@/app/components/Chip'
import { applicationListDocument } from '@/app/apps/operations'
import AppsSubscription from '@/app/components/AppsTable/AppsSubscription'
import { RefreshPageError } from '@/app/components/ErrorBoundary'

export const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Address',
    maxWidth: 250,
    renderCell: (cell: RowApp) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'app'}
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
    field: 'services',
    headerName: 'Services',
    renderCell: (cell: RowApp) => (
      <ChipText moreElements={cell.amountOfServices - 1}>
        {cell.firstService}
      </ChipText>
    )
  },
  {
    field: 'gateways',
    headerName: 'Delegated To',
    description: "Gateways that have permissions to send relays on behalf of this application",
    renderCell: (cell: RowApp) => (
      cell.amountOfGateways ? <ChipText moreElements={cell.amountOfGateways - 1}>
        <div
          key={cell.firstGateway}
          className={'text-[10px] md:text-xs h-[20px] mt-[-4px]'}
        >
          <EntityLink
            entity={'gateway'}
            entityId={cell.firstGateway}
            copy={{
              enabled: false
            }}
          />
        </div>
      </ChipText> : 'None'
    )
  }
]


interface RowApp {
  id: string
  status: string
  stakeAmount: string
  balance: string
  firstService: string
  amountOfServices: number
  firstGateway: string
  amountOfGateways: number
}

interface PageProps {
  page: number
  itemsPerPage: number
  basePath: string
  service?: string
  gateway?: string
}

export default async function AppsTable({page, itemsPerPage, basePath, service, gateway}: PageProps) {
  try {
    const client = getClient()

    let filter

    if (service) {
      filter = {
        applicationServices: {
          some: {
            serviceId: {
              equalTo: service
            }
          }
        }
      }
    }

    if (gateway) {
      filter = {
        applicationGateways: {
          some: {
            gatewayId: {
              equalTo: gateway
            }
          }
        }
      }
    }

    // eslint-disable-next-line prefer-const
    let {data} = await client.query({
      query: applicationListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        filter
      }
    })

    const totalPages = Math.ceil((data.applications?.totalCount || 0) / itemsPerPage)

    if (page > totalPages) {
      page = 1

      const result = await client.query({
        query: applicationListDocument,
        variables: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          filter
        }
      })

      data = result.data
    }

    const rows: Array<RowApp> = data.applications?.nodes?.map((application) => {
      const balance = application.account?.balances?.nodes?.at(0) || {
        amount: '0',
        denom: 'upokt'
      }

      return {
        id: application!.id,
        status: getStakeLabel(application!.stakeStatus),
        stakeAmount: formatAmount({
          amount: application!.stakeAmount,
          denom: application!.stakeDenom,
        }),
        raw_stakeAmount: convertUpoktToPokt(application!.stakeAmount),
        balance: formatAmount(balance),
        raw_balance: convertUpoktToPokt(balance?.amount),
        firstService: application!.services.nodes.at(0)?.serviceId,
        amountOfServices: application!.services.totalCount,
        firstGateway: application!.applicationGateways.nodes.at(0)?.gatewayId,
        amountOfGateways: application!.applicationGateways.totalCount,
      }
    })

    return (
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.applications?.totalCount} applications found`,
          subtitle: (
            <AppsSubscription service={service} />
          )
        }}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath
        }}
      />
    )
  } catch {
    return (
      <RefreshPageError />
    )
  }
}

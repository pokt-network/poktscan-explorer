import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { getStakeLabel } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { ChipText } from '@/app/components/Chip'
import { GatewaysSubscription } from '@/app/components/GatewaysTable/GatewaysSubscription'

export const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'Address',
    minWidth: 200,
    renderCell: (row: RowGateway) => (
      <div className={'text-xs md:text-sm min-w-[200px]'}>
        <EntityLink
          entity={'gateway'}
          entityId={row.id}
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
    field: 'firstApplication',
    headerName: 'Applications Delegating',
    description: "Applications that this gateways have permissions",
    renderCell: (cell: RowGateway) => (
      cell.allApplications ? <ChipText moreElements={cell.allApplications - 1}>
        <div
          key={cell.firstApplication}
          className={'text-[10px] md:text-xs h-[20px] mt-[-4px]'}
        >
          <EntityLink
            entity={'gateway'}
            entityId={cell.firstApplication!}
            copy={{
              enabled: false
            }}
          />
        </div>
      </ChipText> : 'None'
    )
  },
]

const gatewayListDocument = graphql(`
  query gatewayList($limit: Int!, $offset: Int!, $filter: GatewayFilter) {
    gateways(first: $limit, offset: $offset, filter: $filter) {
      totalCount
      nodes {
        id
        account {
          id
          balances {
            nodes {
              amount
              denom
            }
          }
        }
        stakeAmount
        stakeDenom
        stakeStatus
        unstakingBeginBlock {
          height: id
        }
        unstakingEndBlock {
          height: id
        }
        applications: applicationGateways(first: 1) {
          totalCount
          nodes {
            applicationId
          }
        }
      }
    }
    stakedGateways: gateways(filter: {stakeStatus: {equalTo: Staked}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
  }
`)

interface RowGateway {
  id: string
  status: string
  stakeAmount: string
  balance: string
  firstApplication?: string
  allApplications: number
}

interface PageProps {
  page: number
  itemsPerPage: number
  basePath: string
  service?: string
  application?: string
}

export default async function GatewaysTable({page, itemsPerPage, basePath, service, application}: PageProps) {
  let filter = undefined

  if (service) {
    filter = {
      applicationGateways: {
        some: {
          application: {
            applicationServices: {
              some: {
                serviceId: {
                  equalTo: service
                }
              }
            }
          }
        }
      }
    }
  }

  if (application) {
    filter = {
      applicationGateways: {
        some: {
          applicationId: {
            equalTo: application
          }
        }
      }
    }
  }

  let {data} = await getClient().query({
    query: gatewayListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      filter
    }
  })

  const totalPages = Math.ceil((data.gateways?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
      query: gatewayListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        filter
      }
    })

    data = result.data
  }

  const rows: Array<RowGateway> = data.gateways?.nodes?.map((gateway) => {
    const balance = gateway.account?.balances?.nodes?.at(0) || {
      amount: '0',
      denom: 'upokt'
    }

    return {
      id: gateway.id,
      status: getStakeLabel(gateway.stakeStatus),
      stakeAmount: formatAmount({
        amount: gateway.stakeAmount,
        denom: gateway.stakeDenom
      }),
      raw_stakeAmount: convertUpoktToPokt(gateway.stakeAmount),
      balance: formatAmount(balance),
      raw_balance: convertUpoktToPokt(balance?.amount),
      firstApplication: gateway.applications.nodes[0]?.applicationId,
      allApplications: gateway.applications.totalCount,
    }
  })

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data.gateways?.totalCount} gateways found`,
        subtitle: (
          <GatewaysSubscription service={service} />
        )
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath
      }}
      defaultMinWidth={70}
    />
  )
}

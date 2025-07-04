import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { getStakeLabel, stakeFilters, StakeTableFilter } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { ChipText } from '@/app/components/Chip'
import { GatewaysSubscription } from '@/app/components/GatewaysTable/GatewaysSubscription'
import { RefreshPageError } from '@/app/components/ErrorBoundary'
import { GatewayFilter, StakeStatus } from '@/app/config/gql/graphql'

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
            entity={'app'}
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

function getGatewayGraphQlFilter({
  filter,
  application,
  service
}: {
  filter?: string,
  service?: string,
  application?: string,
}): GatewayFilter | undefined {
  if (!filter && !application && !service) {
    return undefined
  }

  let graphQlFilter: GatewayFilter | undefined = undefined

  if (filter && Object.values(StakeTableFilter).includes(filter as StakeTableFilter)) {
    if (filter === StakeTableFilter.LowBalance) {
      graphQlFilter = {
        stakeStatus: {
          equalTo: StakeStatus.Staked
        },
        account: {
          balances: {
            some: {
              denom: {
                equalTo: 'upokt'
              },
              amount: {
                lessThanOrEqualTo: (2 * 1e6).toString()
              }
            }
          }
        }
      }
    } else {
      graphQlFilter = {
        stakeStatus: {
          equalTo: filter === StakeTableFilter.Staked ? StakeStatus.Staked :
            filter === StakeTableFilter.Unstaking ? StakeStatus.Unstaking : StakeStatus.Unstaked
        }
      }
    }
  }

  if (service) {
    graphQlFilter = {
      ...(graphQlFilter! || {}),
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
    graphQlFilter = {
      ...(graphQlFilter! || {}),
      applicationGateways: {
        some: {
          applicationId: {
            equalTo: application
          }
        }
      }
    }
  }

  return graphQlFilter
}

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
  activeFilter?: string
}

export default async function GatewaysTable({page, itemsPerPage, basePath, service, application, activeFilter}: PageProps) {
  try {
    const filter = getGatewayGraphQlFilter({
      application,
      service,
      filter: activeFilter || StakeTableFilter.Staked,
    })

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
        activeFilter={activeFilter || StakeTableFilter.Staked}
        filters={stakeFilters}
      />
    )
  } catch {
    return (
      <RefreshPageError />
    )
  }
}

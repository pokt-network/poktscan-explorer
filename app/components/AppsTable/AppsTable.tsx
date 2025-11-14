'use client'

import { getStakeLabel, stakeFilters, StakeTableFilter } from '@/app/utils/stake'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { useCallback, useMemo } from 'react'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { ChipText } from '@/app/components/Chip'
import { applicationListDocument } from '@/app/(lists)/apps/operations'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { ApplicationFilter, StakeStatus } from '@/app/config/gql/graphql'
import { gql, useQuery } from '@apollo/client'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { LoadingTable } from '@/app/components/LoadingListView'

const paramsForFiltersDocument = gql`
  query paramsForAppsFilters {
    param(id: "application-min_stake") {
      key
      value
    }
  }
`

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

enum AppTableFilters {
  LowStake = 'Low Stake'
}

function useApplicationFilter({
  filter,
  service,
  gateway
}: {
  filter?: string,
  service?: string,
  gateway?: string,
}) {
  // Fetch min stake params for LowStake filter
  const { data: paramsData } = useQuery(paramsForFiltersDocument, {
    skip: filter !== AppTableFilters.LowStake
  })

  const graphQlFilter = useMemo(() => {
    if (!filter && !service && !gateway) {
      return undefined
    }

    let baseFilter: ApplicationFilter | undefined = undefined

    if (filter && Object.values(StakeTableFilter).includes(filter as StakeTableFilter)) {
      if (filter === StakeTableFilter.LowBalance) {
        baseFilter = {
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
        baseFilter = {
          stakeStatus: {
            equalTo: filter === StakeTableFilter.Staked ? StakeStatus.Staked :
              filter === StakeTableFilter.Unstaking ? StakeStatus.Unstaking : StakeStatus.Unstaked
          }
        }
      }
    } else if (filter === AppTableFilters.LowStake) {
      const minStake = paramsData?.param?.value ? JSON.parse(paramsData.param.value)?.amount || '0' : '0'

      baseFilter = {
        stakeStatus: {
          equalTo: StakeStatus.Staked
        },
        stakeAmount: {
          lessThanOrEqualTo: (Number(minStake) + 5e6).toString()
        }
      }
    }

    if (service) {
      baseFilter = {
        ...(baseFilter || {}),
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
      baseFilter = {
        ...(baseFilter || {}),
        applicationGateways: {
          some: {
            gatewayId: {
              equalTo: gateway
            }
          }
        }
      }
    }

    return baseFilter
  }, [filter, service, gateway, paramsData])

  return graphQlFilter
}

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
  activeFilter?: string
}

export default function AppsTable({page, itemsPerPage, basePath, service, gateway, activeFilter}: PageProps) {
  const filter = useApplicationFilter({
    service,
    gateway,
    filter: activeFilter || StakeTableFilter.Staked,
  })

  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
    filter
  }), [page, itemsPerPage, filter])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: applicationListDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof applicationListDocument>,
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
          errorMessage={'Oops. There was an error loading the applications data.'}
        />
      </div>
    )
  }

  const rows: Array<RowApp> = data?.applications?.nodes?.map((application) => {
    const balance = application?.account?.balances?.nodes?.at(0) || {
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
  }) || []

  const totalPages = Math.ceil((data?.applications?.totalCount || 0) / itemsPerPage)

  // Build entity filters for CSV export
  const entityFilters: Record<string, string> = {}
  if (service) entityFilters.service = service
  if (gateway) entityFilters.gateway = gateway

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data?.applications?.totalCount} applications found`,
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath
      }}
      activeFilter={activeFilter || StakeTableFilter.Staked}
      filters={[
        ...stakeFilters,
        {
          label: 'Low Stake',
          value: AppTableFilters.LowStake
        }
      ]}
      csvEndpoint="/api/export/apps"
      entityFilters={Object.keys(entityFilters).length > 0 ? entityFilters : undefined}
    />
  )
}

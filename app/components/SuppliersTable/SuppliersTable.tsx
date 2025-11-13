'use client'

import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { useCallback, useMemo } from 'react'
import { StakeStatus, SupplierFilter } from '@/app/config/gql/graphql'
import { getStakeLabel, stakeFilters, StakeTableFilter } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { ChipText } from '@/app/components/Chip'
import { supplierListDocument, } from '@/app/(lists)/suppliers/operations'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { graphql } from '@/app/config/gql'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { LoadingTable } from '@/app/components/LoadingListView'
import { useQuery } from '@apollo/client'

const paramsForFiltersDocument = graphql(`
  query paramsForSupplierFilters {
    params(
      orderBy: [BLOCK_ID_DESC]
      distinct: [NAMESPACE, KEY]
      filter:  {
        or: [
          {
            namespace:  {
              equalTo: "supplier"
            }
            key: {
              equalTo: "min_stake"
            }
          },
          {
            namespace:  {
              equalTo: "proof"
            }
            key:  {
              equalTo: "proof_missing_penalty"
            }
          }
        ]
      }
    ) {
      nodes {
        key
        value
      }
    }
  }
`)

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

enum SupplierTableFilters {
  LowStake = 'low_stake',
  BelowMinStake = 'below_min_stake',
}

function useSupplierFilter({
  filter,
  service,
  delegators,
  owners
}: {
  filter?: string,
  service?: string,
  owners?: Array<string>,
  delegators?: Array<string>
}) {
  // Fetch params for LowStake and BelowMinStake filters
  const needsParams = filter && Object.values(SupplierTableFilters).includes(filter as SupplierTableFilters)
  const { data: paramsData } = useQuery(paramsForFiltersDocument, {
    skip: !needsParams
  })

  const graphQlFilter = useMemo(() => {
    if (!filter && !service && !owners?.length && !delegators?.length) {
      return undefined
    }

    let baseFilter: SupplierFilter | undefined = undefined

    if (filter && Object.values(StakeTableFilter).includes(filter as StakeTableFilter)) {
      if (filter === StakeTableFilter.LowBalance) {
        baseFilter = {
          stakeStatus: {
            equalTo: StakeStatus.Staked
          },
          operator: {
            balances: {
              some: {
                denom: {
                  equalTo: 'upokt'
                },
                amount: {
                  lessThanOrEqualTo: (1e6 * 2).toString()
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
    } else if (Object.values(SupplierTableFilters).includes(filter as SupplierTableFilters)) {
      const minStake = paramsData?.params?.nodes?.find(param => param?.key === 'min_stake')?.value
        ? JSON.parse(paramsData.params.nodes.find(param => param?.key === 'min_stake')!.value!)?.amount || '0'
        : '0'
      const proofMissingPenalty = paramsData?.params?.nodes?.find(param => param?.key === 'proof_missing_penalty')?.value
        ? JSON.parse(paramsData.params.nodes.find(param => param?.key === 'proof_missing_penalty')!.value!)?.amount || '0'
        : '0'

      if (filter === SupplierTableFilters.LowStake) {
        baseFilter = {
          stakeStatus: {
            equalTo: StakeStatus.Staked
          },
          stakeAmount: {
            lessThanOrEqualTo: (Number(minStake) + (Number(proofMissingPenalty) * 5)).toString(),
            greaterThanOrEqualTo: minStake
          }
        }
      } else if (filter === SupplierTableFilters.BelowMinStake) {
        baseFilter = {
          stakeStatus: {
            equalTo: StakeStatus.Staked
          },
          stakeAmount: {
            lessThanOrEqualTo: minStake,
          }
        }
      }
    }

    if (service) {
      baseFilter = {
        ...(baseFilter || {}),
        serviceConfigs: {
          some: {
            serviceId: {
              equalTo: service
            }
          }
        }
      }
    }

    if (owners?.length) {
      baseFilter = {
        ...(baseFilter || {}),
        ownerId: {
          in: owners
        }
      }
    }

    if (delegators?.length) {
      baseFilter = {
        ...(baseFilter || {}),
        serviceConfigs: {
          some: {
            or: delegators.map(address => ({
              revShare: {
                contains: [{ address }]
              }
            }))
          }
        }
      }
    }

    return baseFilter
  }, [filter, service, owners, delegators, paramsData])

  return graphQlFilter
}

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
  delegators?: Array<string>
  activeFilter?: string
}

export default function SuppliersTable({page, itemsPerPage, basePath, service, owners, delegators, activeFilter}: PageProps) {
  const filter = useSupplierFilter({
    filter: activeFilter || StakeTableFilter.Staked,
    service,
    owners,
    delegators
  })

  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
    filter
  }), [page, itemsPerPage, filter])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: supplierListDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof supplierListDocument>,
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
          errorMessage={'Oops. There was an error loading the suppliers data.'}
        />
      </div>
    )
  }

  const rows: Array<RowSupplier> = data?.suppliers?.nodes?.map((supplier) => {
    const isCustodian = supplier!.stakeStatus === StakeStatus.Staked && supplier!.operatorId === supplier!.ownerId
    const balance = supplier!.operator?.balances?.nodes?.at(0) || {
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
      raw_balance: convertUpoktToPokt(balance?.amount || 0),
      outputBalance: isCustodian ? '-' : formatAmount(outputBalance),
      raw_outputBalance: isCustodian ? '0' : convertUpoktToPokt(outputBalance?.amount || 0),
      outputAddress: isCustodian ? '-' : supplier!.ownerId,
      amountOfServices: supplier!.supplierServices.totalCount,
      firstService: supplier!.supplierServices.nodes[0]?.serviceId,
      services: supplier!.supplierServices.totalCount
    }
  }) || []

  const totalPages = Math.ceil((data?.suppliers?.totalCount || 0) / itemsPerPage)

  // Build entity filters for CSV export
  const entityFilters: Record<string, string | string[]> = {}
  if (service) entityFilters.service = service
  if (owners?.length) entityFilters.owners = owners
  if (delegators?.length) entityFilters.delegators = delegators

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data?.suppliers?.totalCount} suppliers found`,
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath,
      }}
      defaultMinWidth={70}
      activeFilter={activeFilter || StakeTableFilter.Staked}
      filters={[
        ...stakeFilters,
        {
          label: 'Low Stake',
          value: SupplierTableFilters.LowStake,
        },
        {
          label: 'Below Min Stake',
          value: SupplierTableFilters.BelowMinStake,
        }
      ]}
      csvEndpoint="/api/export/suppliers"
      entityFilters={Object.keys(entityFilters).length > 0 ? entityFilters : undefined}
    />
  )
}

'use client'

import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import ListTitle from '@/app/components/ListTitle'
import React, { useCallback } from 'react'
import { serviceListDocument } from '@/app/(lists)/services/operations'
import { formatSimpleAmount } from '@/app/utils/format'
import { LoadingTable } from '@/app/components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { useSearchParams } from 'next/navigation'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'ID',
    minWidth: 200,
    renderCell: (row: RowService) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'service'}
          entityId={row.id}
        />
      </div>
    )
  },
  {
    field: 'name',
    headerName: 'Label',
  },
  {
    field: 'computeUnitsPerRelay',
    headerName: 'Compute Units Per Relay',
    align: 'right'
  },
  {
    field: 'relayMiningDifficulty',
    headerName: 'Relay Mining Difficulty',
    align: 'right'
  },
  {
    field: 'apps',
    headerName: 'Applications',
    align: 'right'
  },
  {
    field: 'suppliers',
    headerName: 'Suppliers',
    align: 'right'
  }
]

interface RowService {
  id: string
  name: string
  computeUnitsPerRelay: string
  relayMiningDifficulty: string
  apps: number
  suppliers: number
}

function ServicesTable() {
  const searchParams = useSearchParams()

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
  }), [page, itemsPerPage])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: serviceListDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof serviceListDocument>,
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
          errorMessage={'Oops. There was an error loading the services data.'}
        />
      </div>
    )
  }

  const rows: Array<RowService> = data?.services?.nodes?.map((service) => {
    const relayMiningDifficulty = service?.relayMiningDifficultyUpdatedEvents?.nodes?.at(0)?.newNumRelaysEma
    return {
      id: service.id!,
      name: service.name!,
      computeUnitsPerRelay: formatSimpleAmount(service?.computeUnitsPerRelay),
      apps: service?.apps?.totalCount || 0,
      suppliers: service?.suppliers?.totalCount || 0,
      relayMiningDifficulty: relayMiningDifficulty ? formatSimpleAmount(relayMiningDifficulty) : '-'
    }
  }) || []

  const totalPages = Math.ceil((data?.services?.totalCount || 0) / itemsPerPage)

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data?.services?.totalCount} services found`,
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath: '/services'
      }}
      defaultMinWidth={70}
      csvEndpoint="/api/export/services"
    />
  )
}

export default function ServicesPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Services'} />
      <ServicesTable />
    </div>
  )
}

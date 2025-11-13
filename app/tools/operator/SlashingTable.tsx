'use client'

import { slashedDocument } from '@/app/tools/operator/operations'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import React, { useCallback, useMemo } from 'react'
import { convertUpoktToPokt, formatUpokt } from '@/app/utils/format'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { LoadingTable } from '@/app/components/LoadingListView'

interface SlashRow {
  id: string
  supplier: string
  blockId: string

  proofValidationStatus: string

  slashed: string
  raw_slashed: number
  previousStake: string
  raw_previousStake: number
  afterStake: string
  raw_afterStake: number

  sessionId: string
  serviceId: string
  applicationId: string
}

export const slashedColumns: Array<GridColDef> = [
  {
    field: 'supplier',
    headerName: 'Supplier',
    minWidth: 200,
    renderCell: (cell: SlashRow) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'supplier'}
          entityId={cell.supplier}
        />
      </div>
    )
  },
  {
    field: 'blockId',
    headerName: 'Height',
    minWidth: 100,
    renderCell: (cell: SlashRow) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'block'}
          entityId={cell.blockId}
        />
      </div>
    )
  },
  {
    field: 'slashed',
    headerName: 'Slashed Amount',
    align: 'right',
    description: 'Amount slashed due to missing/invalid proof.',
  },
  {
    field: 'previousStake',
    headerName: 'Prev. Stake',
    align: 'right',
    description: 'Stake of the supplier before of the slashing.',
  },
  {
    field: 'afterStake',
    headerName: 'After Stake',
    align: 'right',
    description: 'Stake of the supplier after of the slashing.',
  },
  {
    field: 'proofValidationStatus',
    headerName: 'Proof Status',
    description: 'Validation status of the proof.'
  },
  {
    field: 'serviceId',
    headerName: 'Service',
    description: 'Service that the supplier was serving in the session.',
    renderCell: (cell: SlashRow) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'service'}
          entityId={cell.serviceId}
        />
      </div>
    )
  },
  {
    field: 'applicationId',
    headerName: 'Application',
    description: 'App that the supplier was serving relays in the session.',
    minWidth: 200,
    renderCell: (cell: SlashRow) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'app'}
          entityId={cell.applicationId}
        />
      </div>
    )
  },
]

interface SlashingTableProps {
  page: number
  itemsPerPage: number
  basePath: string
  delegators: Array<string>
  activeFilter?: string
}

export default function SlashingTable({
  page,
  itemsPerPage,
  basePath,
  delegators,
}: SlashingTableProps) {
  const filter = useMemo(() => ({
    supplier: {
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
  }), [delegators])

  const variables = useCallback(() => ({
    limit: itemsPerPage,
    offset: (page - 1) * itemsPerPage,
    filter
  }), [page, itemsPerPage, filter])

  const { data, error, isLoading, refetch } = useFetchOnBlock({
    query: slashedDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof slashedDocument>,
    initialError: false
  })

  if (isLoading) {
    return (
      <LoadingTable
        columns={slashedColumns}
        rowsAmount={itemsPerPage}
      />
    )
  }

  if (error) {
    return (
      <div className={"bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the slashing data.'}
        />
      </div>
    )
  }

  const rows: Array<SlashRow> = (data?.eventSupplierSlasheds?.nodes || []).map(row => {
    if (!row) {
      throw new Error('Row is empty')
    }

    return ({
      id: `${row.supplierId}-${row.blockId}-${row.serviceId}-${row.applicationId}-${row.sessionId}`,

      supplier: row.supplierId,
      blockId: row.blockId,

      proofValidationStatus: row.proofValidationStatus || '',

      slashed: formatUpokt({
        amount: row.proofMissingPenalty
      }),
      raw_slashed: convertUpoktToPokt(row.proofMissingPenalty),
      previousStake: formatUpokt({
        amount: row.previousStakeAmount
      }),
      raw_previousStake: convertUpoktToPokt(row.previousStakeAmount),
      afterStake: formatUpokt({
        amount: row.afterStakeAmount
      }),
      raw_afterStake: convertUpoktToPokt(row.afterStakeAmount),
      sessionId: row.sessionId,
      serviceId: row.serviceId,
      applicationId: row.applicationId,
    })
  })

  const totalPages = Math.ceil((data?.eventSupplierSlasheds?.totalCount || 0) / itemsPerPage)

  return (
    <Table
      header={{
        title: `${data?.eventSupplierSlasheds?.totalCount || 0} slashed events found`,
      }}
      columns={slashedColumns}
      rows={rows}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath,
      }}
      defaultMinWidth={70}
    />
  )
}

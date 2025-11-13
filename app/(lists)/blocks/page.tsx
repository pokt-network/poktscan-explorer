'use client'

import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import { formatTimeDifference } from '@/app/(home)/utils'
import { convertUpoktToPokt, formatAmount, formatSimpleAmount, formatSize } from '@/app/utils/format'
import ListTitle from '@/app/components/ListTitle'
import React, { useCallback } from 'react'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { blockListDocument } from '@/app/(lists)/blocks/operations'
import Summary from '@/app/(lists)/blocks/Summary'
import { LabelByIndex } from '@/app/components/FourCards/utils'
import { LoadingTable } from '../../components/LoadingListView'
import { BaseRetryError } from '@/app/components/ErrorBoundary'
import { useSearchParams } from 'next/navigation'
import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'

const summaryLabels: LabelByIndex = {
  1: 'Last Block',
  2: 'Transactions',
  3: 'Production Time (Avg. 24H)',
  4: 'Total Size (Avg. 24H)',
}

const columns: Array<GridColDef> = [
  {
    field: 'height',
    headerName: 'Height',
    renderCell: (cell: RowBlock) => (
      <div className={'text-xs md:text-sm'}>
        <EntityLink
          entity={'block'}
          entityId={cell.height}
        />
      </div>
    )
  },
  {
    field: 'timestamp',
    headerName: <DateColumn />,
    align: 'center',
    width: 180,
    renderCell: (row: RowBlock) => (
      <div className={'text-xs md:text-sm'}>
        <DateCellText value={row.timestamp} />
      </div>
    )
  },
  {
    field: 'proposer',
    headerName: 'Proposer',
    maxWidth: 200,
  },
  {
    field: 'took',
    headerName: 'Took',
    align: 'right',
  },
  {
    field: 'supply',
    headerName: 'Total Supply',
    align: 'right',
  },
  {
    field: 'txAmount',
    headerName: 'Transactions',
    align: 'right',
  },
  {
    field: 'nodes',
    headerName: 'Suppliers',
    align: 'right',
  },
  {
    field: 'apps',
    headerName: 'Apps',
    align: 'right',
  },
  {
    field: 'gateways',
    headerName: 'Gateways',
    align: 'right',
  },
  {
    field: 'relays',
    headerName: 'Relays',
    align: 'right',
  },
  {
    field: 'size',
    headerName: 'Size',
    align: 'right',
  }
]

interface RowBlock {
  id: string
  height: number
  timestamp: string
  proposer: string
  txAmount: number
  nodes: number
  took: number
  apps: number
  gateways: number
  relays: number
  size: number
  supply: string
}

function BlocksTable() {
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
    query: blockListDocument,
    variables,
    initialResult: null as unknown as DocumentNodeData<typeof blockListDocument>,
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
      <div className={"h-[400px] flex bg-[color:--main-background] pt-3 pb-1 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
        <BaseRetryError
          onRetry={refetch}
          errorMessage={'Oops. There was an error loading the blocks data.'}
        />
      </div>
    )
  }

  const rows: Array<RowBlock> = data?.blocks?.nodes?.map((block) => {
    const supply = block?.supplies?.nodes?.find((item) => item?.supply?.denom === 'upokt')?.supply || {
      amount: '0',
      denom: 'upokt',
    }
    return ({
      id: block!.height,
      height: Number(block!.height),
      timestamp: block!.timestamp,
      txAmount: formatSimpleAmount(block!.totalTxs),
      proposer: block!.proposerAddress,
      nodes: formatSimpleAmount(block!.stakedSuppliers),
      apps: formatSimpleAmount(block!.stakedApps),
      took: formatTimeDifference(block!.timeToBlock),
      gateways: formatSimpleAmount(block!.stakedGateways),
      relays: formatSimpleAmount(block!.totalRelays),
      size: formatSize(block!.size),
      supply: formatAmount(supply),
      raw_supply: convertUpoktToPokt(supply?.amount),
    })
  }) || []

  const totalPages = Math.ceil((data?.blocks?.totalCount || 0) / itemsPerPage)

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data?.blocks?.totalCount} blocks found`,
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath: '/blocks'
      }}
      defaultMinWidth={70}
      csvEndpoint="/api/export/blocks"
    />
  )
}

export default function BlocksPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Blocks'} />
      <Summary
        initialData={null as any}
        initialError={false}
        labels={summaryLabels}
      />
      <BlocksTable />
    </div>
  )
}

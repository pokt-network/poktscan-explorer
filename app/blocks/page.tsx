import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import { getPageAndItems } from '@/app/utils/pagination'
import { formatTimeDifference } from '@/app/(home)/utils'
import { getLatestBlock } from '@/app/api/blocks'
import { convertUpoktToPokt, formatAmount, formatSimpleAmount, formatSize } from '@/app/utils/format'
import ListTitle from '@/app/components/ListTitle'
import React from 'react'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { blockListDocument, blockSummaryDocument } from '@/app/blocks/operations'
import { getSummaryVariables } from '@/app/blocks/utils'
import Summary from '@/app/blocks/Summary'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import { subscriptionQuery } from '@/app/operations/block'

export const dynamic = "force-dynamic";

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

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BlocksPage({searchParams}: PageProps) {
  const [pageInfo, latestBlock] = await Promise.all([
    getPageAndItems(searchParams),
    getLatestBlock()
  ])
  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage


  const currentDate = new Date(latestBlock.timestamp)
  const last24hDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)

  const client = getClient()

  // eslint-disable-next-line prefer-const
  let [{data}, {data: summaryData}] = await Promise.all([
    client.query({
      query: blockListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      }
    }),
    client.query({
      query: blockSummaryDocument,
      variables: getSummaryVariables(latestBlock.timestamp)
    })
  ])

  const totalPages = Math.ceil((data.blocks?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await client.query({
      query: blockListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        endDate: currentDate.toISOString(),
        startDate: last24hDate.toISOString(),
      }
    })

    data = result.data
  }

  const rows: Array<RowBlock> = data.blocks?.nodes?.map((block) => {
    const supply = block.supplies.nodes.find((item) => item.supply.denom === 'upokt')?.supply || {
      amount: '0',
      denom: 'upokt',
    }
    return ({
      id: block.id,
      height: Number(block.height),
      timestamp: block.timestamp,
      txAmount: formatSimpleAmount(block.totalTxs),
      proposer: block.proposerAddress,
      nodes: formatSimpleAmount(block.stakedSuppliers),
      apps: formatSimpleAmount(block.stakedApps),
      took: formatTimeDifference(block.timeToBlock),
      gateways: formatSimpleAmount(block.stakedGateways),
      relays: formatSimpleAmount(block.totalRelays),
      size: formatSize(block.size),
      supply: formatAmount(supply),
      raw_supply: convertUpoktToPokt(supply?.amount),
    })
  }) || []

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
        <DateCellText value={row.timestamp} />
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

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Blocks'} />
      <Summary initialData={summaryData} />
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.blocks?.totalCount} blocks found`,
          subtitle: (
            <NewEntitiesFound<typeof subscriptionQuery>
              subscription={subscriptionQuery}
              entity={'blocks'}
            />
          )
        }}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath: '/blocks'
        }}
        defaultMinWidth={70}
      />
    </div>
  )
}

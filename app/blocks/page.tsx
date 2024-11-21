import FourCard from '@/app/components/FourCard'
import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import { getPageAndItems } from '@/app/utils/pagination'
import millify from 'millify'
import { formatTimeDifference } from '@/app/(home)/utils'
import { formatBalance } from '@/app/utils/balances'
import { getLatestBlock } from '@/app/api/blocks'

export const dynamic = "force-dynamic";

const blockListDocument = graphql(`
  query blockList($limit: Int!, $offset: Int!, $startDate: Datetime!, $endDate: Datetime!) {
    blocks(first: $limit, offset: $offset, orderBy: HEIGHT_DESC) {
      nodes {
        id
        height
        timestamp
        totalTxs
        timeToBlock
        successfulTxs
        stakedApps
        stakedSuppliers
        stakedGateways
        totalRelays
        totalComputedUnits
        proposerAddress
        size
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
      }
      totalCount
    }
    avgs: blocks(filter: {timestamp: {greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate}}) {
      aggregates {
        average {
          timeToBlock
          size
        }
      }
    }
  }
`)

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

  let {data} = await getClient().query({
    query: blockListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      endDate: currentDate.toISOString(),
      startDate: last24hDate.toISOString(),
    }
  })

  const totalPages = Math.ceil((data.blocks?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
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

  const rows: Array<RowBlock> = data.blocks?.nodes?.map((block) => ({
    id: block.id,
    height: Number(block.height),
    timestamp: block.timestamp,
    txAmount: block.totalTxs,
    proposer: block.proposerAddress,
    nodes: block.stakedSuppliers,
    apps: block.stakedApps,
    took: formatTimeDifference(block.timeToBlock),
    gateways: block.stakedGateways,
    relays: block.totalRelays,
    size: block.size,
    supply: formatBalance(block.supplies.nodes.find((item) => item.supply.denom === 'upokt')?.supply || {
      amount: '0',
      denom: 'upokt'
    }),
  })) || []

  const columns: Array<GridColDef> = [
    {
      field: 'height',
      headerName: 'Height',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderCell: (cell: any) => (
        <EntityLink
          entity={'block'}
          entityId={cell.height}
        />
      )
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      minWidth: 200,
    },
    {
      field: 'took',
      headerName: 'Took',
    },
    {
      field: 'proposer',
      headerName: 'Proposer',
    },
    {
      field: 'supply',
      headerName: 'Total Supply',
    },
    {
      field: 'txAmount',
      headerName: 'Transactions',
    },
    {
      field: 'nodes',
      headerName: 'Suppliers',
    },
    {
      field: 'apps',
      headerName: 'Apps',
    },
    {
      field: 'gateways',
      headerName: 'Gateways',
    },
    {
      field: 'relays',
      headerName: 'Relays',
    },
    {
      field: 'size',
      headerName: 'Size',
      renderCell: (cell: RowBlock) => (
        <p className={"text-xs"}>
          {millify(cell.size, {
            units: ["B", "KB", "MB", "GB", "TB"],
            space: true,
          })}
        </p>
      )
    }
  ]

  return (
    <div className={"px-3 py-10 md:px-10 gap-5 flex flex-col"}>
      <h1 className={'text-2xl font-semibold'}>
        Blocks
      </h1>
      <FourCard
        items={[
          {
            label: 'Last Block',
            children: (
              <EntityLink
                entity={'block'}
                entityId={latestBlock?.height || 1}
              />
            )
          },
          {
            label: 'Transactions',
            children: latestBlock?.totalTxs
          },
          {
            label: 'Production Time (Avg. 24H)',
            children: formatTimeDifference(data?.avgs?.aggregates?.average?.timeToBlock || 0)
          },
          {
            label: 'Total Size (Avg. 24H)',
            children: millify(data?.avgs?.aggregates?.average?.size || 0, {
              units: ["B", "KB", "MB", "GB", "TB"],
              space: true,
            })
          },
        ]}
      />
      <Table columns={columns} rows={rows} header={{title: `${data.blocks?.totalCount} blocks found`}} pagination={{currentPage: page, totalPages, itemsPerPage, basePath: '/blocks'}} />
    </div>
  )
}

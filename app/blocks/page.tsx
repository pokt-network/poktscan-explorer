import FourCard from '@/app/components/FourCard'
import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import { getPageAndItems } from '@/app/utils/pagination'

const blockListDocument = graphql(`
  query blockList($limit: Int!, $offset: Int!) {
    blocks(first: $limit, offset: $offset, orderBy: HEIGHT_DESC) {
      nodes {
        id
        height
        timestamp
        txAmount
        proposerId
      }
      totalCount
    }
    latestBlock: blocks(first: 1, orderBy: HEIGHT_DESC) {
      nodes {
        height
        txAmount
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
  totalSize: number
  blockSize: number
  stateSize: number
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BlocksPage({searchParams}: PageProps) {
  let {page, itemsPerPage} = await getPageAndItems(searchParams)

  let {data} = await getClient().query({
    query: blockListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage
    }
  })

  const totalPages = Math.ceil((data.blocks?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
      query: blockListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
    })

    data = result.data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: Array<RowBlock> = data.blocks?.nodes?.map((block: any) => ({
    id: block.id,
    height: Number(block.height),
    timestamp: block.timestamp,
    txAmount: block.txAmount,
    proposer: block.proposerId,
    nodes: 0,
    apps: 0,
    took: 0,
    gateways: 0,
    relays: 0,
    totalSize: 0,
    blockSize: 0,
    stateSize: 0
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
      field: 'blockSize',
      headerName: 'Size',
    }
  ]

  const latestBlock = data.latestBlock?.nodes?.at(0)

  return (
    <div className={"p-10 gap-5 flex flex-col"}>
      <h1 className={"text-4xl"}>
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
            children: latestBlock?.txAmount
          },
          {
            label: 'Production Time (Avg. 24H)',
            children: 2
          },
          {
            label: 'Total Size (Avg. 24H)',
            children: 3
          },
        ]}
      />
      <Table columns={columns} rows={rows} header={{title: 'Blocks', subtitle: 'Blocks'}} pagination={{currentPage: page, totalPages, itemsPerPage, basePath: '/blocks'}} />
    </div>
  )
}

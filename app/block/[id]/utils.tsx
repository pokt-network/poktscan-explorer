import { getClient } from '@/app/config/apollo/rsc'
import { Block } from '@/app/config/gql/graphql'
import React from 'react'
import { graphql } from '@/app/config/gql'
import { Skeleton } from '@/components/ui/skeleton'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { formatTimeDifference } from '@/app/(home)/utils'
import { formatAmount, formatSimpleAmount, formatSize } from '@/app/utils/format'

const blockByHeightDocument = graphql(`
  query blockByHeight($height: BigFloat!) {
    block(id: $height) {
      hash
      height: id
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
      stakedAppsTokens
      stakedSuppliersTokens
      stakedGatewaysTokens
      size
      supplies {
        nodes {
          supply {
            denom
            amount
          }
        }
      }
      metadata {
        header
        lastCommit
        blockId
      }
    }
  }
`)

const blockByHashDocument = graphql(`
  query blockByHash($hash: String!) {
    blocks(
      filter: {
        hash: { equalTo: $hash }
      }
      first: 1
    ) {
      nodes {
        height: id
        hash
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
        stakedAppsTokens
        stakedSuppliersTokens
        stakedGatewaysTokens
        size
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
        metadata {
          header
          lastCommit
          blockId
        }
      }
    }
  }
`)

type BlockWithHeight = Omit<Block, 'id'> & {
  height: Block['id']
}

export const getBlock = React.cache(async (id: string) => {
  let block: BlockWithHeight | null = null

  if (isNaN(Number(id))) {
    const {data} = await getClient().query({
      query: blockByHashDocument,
      variables: {hash: id.toUpperCase()}
    })

    block = data.blocks?.nodes?.at(0) as unknown as BlockWithHeight
  } else {
    const {data} = await getClient().query({
      query: blockByHeightDocument,
      variables: {height: id}
    })

    block = data.block as unknown as BlockWithHeight
  }

  return block
})

export function getRows(block, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  return [
    {
      type: 'row',
      label: <DateColumn />,
      value: skeleton || (
        <div className={"text-sm"}>
          <DateCellText value={block.timestamp} />
        </div>
      )
    },
    {
      type: 'row',
      label: 'Took',
      value: skeleton || formatTimeDifference(block.timeToBlock!)
    },
    {
      type: 'row',
      label: 'Transactions',
      value: skeleton || formatSimpleAmount(block.totalTxs)
    },
    {
      type: 'row',
      label: 'Proposer',
      value: skeleton || formatSimpleAmount(block.proposerAddress)
    },
    {
      type: 'row',
      label: 'Size',
      value: skeleton || formatSize(block.size)
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Total Supply',
      value: skeleton || formatAmount(block.supplies.nodes.find((item) => item?.supply?.denom === 'upokt')?.supply || {
        amount: '0',
        denom: 'upokt'
      })
    },
    {
      type: 'row',
      label: 'Apps Staked Tokens',
      value: skeleton || formatAmount({
        amount: block.stakedAppsTokens,
        denom: 'upokt'
      })
    },
    {
      type: 'row',
      label: 'Apps Staked',
      value: skeleton || formatSimpleAmount(block.stakedApps)
    },
    {
      type: 'row',
      label: 'Suppliers Staked Tokens',
      value: skeleton || formatAmount({
        amount: block.stakedSuppliersTokens,
        denom: 'upokt'
      })
    },
    {
      type: 'row',
      label: 'Suppliers Staked',
      value: skeleton || formatSimpleAmount(block.stakedSuppliers)
    },
    {
      type: 'row',
      label: 'Gateways Staked Tokens',
      value: skeleton || formatAmount({
        amount: block.stakedGatewaysTokens,
        denom: 'upokt'
      })
    },
    {
      type: 'row',
      label: 'Gateways Staked',
      value: skeleton || formatSimpleAmount(block.stakedGateways)
    },
    {
      type: 'row',
      label: 'Relays',
      value: skeleton || formatSimpleAmount(block.totalRelays)
    },
    {
      type: 'row',
      label: 'Computed Units',
      value: skeleton || formatSimpleAmount(block.totalComputedUnits)
    },
  ]
}

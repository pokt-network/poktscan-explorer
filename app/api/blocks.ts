import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import { cache } from 'react'
import { Block } from '@/app/config/gql/graphql'

const latestBlockQuery = graphql(`
  query latestBlock {
    blocks(orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        height
        timestamp
        totalTxs
        id
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
        totalComputedUnits
        totalRelays
        failedTxs
        successfulTxs
        totalTxs
        stakedSuppliers
        stakedSuppliersTokens
        unstakingSuppliers
        unstakingSuppliersTokens
        timeToBlock
        unstakedSuppliers
        unstakedSuppliersTokens
        stakedApps
        stakedAppsTokens
        unstakingApps
        unstakingAppsTokens
        unstakedApps
        unstakedAppsTokens
        stakedGateways
        stakedGatewaysTokens
        unstakedGateways
        unstakedGatewaysTokens
      }
    }
  }
`)

export const getLatestBlock = cache(async (): Promise<Block> => {
  const {data} = await getClient().query({
    query: latestBlockQuery
  })

  return data.blocks.nodes.at(0)
})

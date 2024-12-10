import { graphql } from '@/app/config/gql'

export const latestBlockQuery = graphql(`
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

export const subscriptionQuery = graphql(`
  subscription blocks {
    blocks {
      id
      mutation_type
      _entity {
        height
        timestamp
      }
    }
  }
`)

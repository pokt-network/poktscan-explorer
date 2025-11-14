import { gql } from '@apollo/client'

export const statusQuery = gql`
  query status {
    blocks(orderBy: ID_DESC, first: 1) {
      nodes {
        id
        timestamp
        totalRelays
      }
    }
    _metadata {
      targetHeight
      lastProcessedHeight
    }
  }
`

export const latestBlockQuery = gql`
  query latestBlock {
    blocks(orderBy: ID_DESC, first: 1) {
      nodes {
        hash
        height: id
        timestamp
        totalTxs
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
`

export const numBlocksPerSessionDocument = gql`
  query numBlocksPerSession {
    params(
      filter:  {
        key:  {
          equalTo: "num_blocks_per_session"
        }
        namespace:  {
          equalTo: "shared"
        }
      }
      orderBy: [BLOCK_ID_DESC]
      first: 1
    ) {
      nodes {
        blockId
        key
        namespace
        value
      }
    }
  }
`

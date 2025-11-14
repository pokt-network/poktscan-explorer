import { gql } from '@apollo/client'

export const serviceListDocument = gql`
  query serviceList($limit: Int!, $offset: Int!) {
    services(first: $limit, offset: $offset) {
      totalCount
      nodes {
        id
        name
        computeUnitsPerRelay
        ownerId
        apps: applicationServices {
          totalCount
        }
        suppliers: supplierServiceConfigs {
          totalCount
        }
        relayMiningDifficultyUpdatedEvents(
          orderBy: BLOCK_ID_DESC
          first: 1
        ) {
          nodes {
            newNumRelaysEma
          }
        }
      }
    }
  }
`

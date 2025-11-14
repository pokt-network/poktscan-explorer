import { gql } from '@apollo/client'

export const serviceByIdDocument = gql`
  query serviceById($id: String!) {
    service(id: $id) {
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
`

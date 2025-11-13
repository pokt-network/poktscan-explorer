import { graphql } from '@/app/config/gql'

export const serviceListDocument = graphql(`
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
`)

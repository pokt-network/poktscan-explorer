import { graphql } from '@/app/config/gql'

export const serviceByIdDocument = graphql(`
  query serviceById($id: String!) {
    service(id: $id) {
      id
      name
      computeUnitsPerRelay
      ownerId
      newNumRelaysEma
      apps: applicationServices {
        totalCount
      }
      suppliers: supplierServiceConfigs {
        totalCount
      }
    }
  }
`)

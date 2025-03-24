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
        newNumRelaysEma
        apps: applicationServices {
          totalCount
        }
        suppliers: supplierServiceConfigs {
          totalCount
        }
      }
    }
  }
`)

export const servicesSubscription = graphql(`
  subscription servicesSubscription {
    services {
      id
    }
  }
`)

import { gql } from '@apollo/client'

export const supplierByIdDocument = gql`
  query supplierById($id: String!) {
    supplier(id: $id) {
      id
      owner {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
      operator {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
      stakeAmount
      stakeDenom
      stakeStatus
      unstakingEndBlock {
        height: id
      }
      unstakingBeginBlock {
        height: id
      }
      unstakingEndHeight
      supplierServices: serviceConfigs {
        nodes {
          activatedAt {
            id
          }
          revShare
          endpoints
          service {
            id
            name
          }
        }
      }
    }
  }
`

export const servicesOfSupplier = gql`
  query servicesOfSupplier($address: String!, $cursor: Cursor) {
    supplierServiceConfigs(
      filter: {
        supplierId: {
          equalTo: $address
        }
      }
      after: $cursor
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        serviceId
        revShare
        endpoints
        activatedAtId
      }
    }
  }
`

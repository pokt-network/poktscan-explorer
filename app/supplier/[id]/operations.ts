import { graphql } from '@/app/config/gql'

export const supplierByIdDocument = graphql(`
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
`)

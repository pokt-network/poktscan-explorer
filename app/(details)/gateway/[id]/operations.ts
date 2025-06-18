import { graphql } from '@/app/config/gql'

export const gatewayByIdDocument = graphql(`
  query gatewayById($id: String!) {
    gateway(id: $id) {
      id
      account {
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
      unstakingEndHeight
      unstakingBeginBlock {
        height: id
      }
      unstakingEndBlock {
        height: id
      }
    }
  }
`)

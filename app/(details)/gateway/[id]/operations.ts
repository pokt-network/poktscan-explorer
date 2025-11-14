import { gql } from '@apollo/client'

export const gatewayByIdDocument = gql`
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
`

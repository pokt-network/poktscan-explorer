import { graphql } from '@/app/config/gql'

export const appByIdDocument = graphql(`
  query appById($id: String!) {
    application(id: $id) {
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
      unstakingEndBlock {
        height
      }
      unstakingBeginBlock {
        height
      }
      unstakingEndHeight
      services:applicationServices {
        nodes {
          service {
            id
            name
          }
        }
      }
      gateways: applicationGateways {
        nodes {
          gatewayId
        }
      }
      transferEndBlock {
        height
      }
      sourceApplicationId
      transferredFromAt {
        height
      }
      destinationApplicationId
      transferringToId
      transferEndHeight
    }
  }
`)

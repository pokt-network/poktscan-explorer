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
      unstakingBeginBlock {
        height: id
      }
      unstakingEndBlock {
        height: id
      }
      applications: applicationGateways {
        nodes {
          application {
            id
            applicationServices {
              nodes {
                service {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`)

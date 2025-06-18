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
        height: id
      }
      unstakingBeginBlock {
        height: id
      }
      unstakingEndHeight
      services: applicationServices {
        nodes {
          serviceId
        }
      }
      transferEndBlock {
        height: id
      }
      sourceApplicationId
      transferredFromAt {
        height: id
      }
      destinationApplicationId
      transferringToId
      transferEndHeight
    }
  }
`)

export const getDelegatedToDocument = graphql(`
  query getDelegatedTo($id: String!, $cursor: Cursor!) {
    applicationGateways(filter: {applicationId: {equalTo: $id}}, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        gateway {
          id
          stakeAmount
          stakeDenom
        }
      }
    }
  }
`)

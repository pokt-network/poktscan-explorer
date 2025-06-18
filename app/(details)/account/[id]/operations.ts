import { graphql } from '@/app/config/gql'

export const accountByIdDocument = graphql(`
  query accountById($id: String!) {
    account(id: $id) {
      id
      balances {
        nodes {
          amount
          denom
          lastUpdatedBlock {
            height: id
            timestamp
          }
        }
      }
    }
  }
`)

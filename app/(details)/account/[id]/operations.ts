import { gql } from '@apollo/client'

export const accountByIdDocument = gql`
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
`

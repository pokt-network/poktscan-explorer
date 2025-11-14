import { gql } from '@apollo/client'

export const validatorByIdDocument = gql`
  query validatorById($id: String!) {
    validator(id: $id) {
      id
      signerId
      description
      commission
      minSelfDelegation
      stakeDenom
      stakeAmount
      stakeStatus
      signer {
        id
        balances {
          nodes {
            amount
            denom
          }
        }
      }
    }
  }
`

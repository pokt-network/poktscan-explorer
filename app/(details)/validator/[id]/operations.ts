import { graphql } from '@/app/config/gql'

export const validatorByIdDocument = graphql(`
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
`)

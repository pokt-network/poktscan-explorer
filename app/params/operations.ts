import { gql } from '@apollo/client'

export const paramsDocument = gql`
  query params {
    params(
      orderBy: [BLOCK_ID_DESC]
      distinct: [NAMESPACE, KEY]
      first: 1000
    ) {
      nodes {
        namespace
        id
        key
        value
        block {
          height: id
        }
      }
    }
  }
`

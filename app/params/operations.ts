import { graphql } from '@/app/config/gql'

export const paramsDocument = graphql(`
  query params {
    params(orderBy: BLOCK_ID_DESC, first: 1000) {
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
`)

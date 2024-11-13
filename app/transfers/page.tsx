import { graphql } from '@/app/config/gql'

const transferListDocument = graphql(`
  query transferList($limit: Int!, $offset: Int!) {
    nativeTransfers(first: $limit, offset: $offset) {
      totalCount
      nodes {
        id
        fromId
        toId
        amounts
        block {
          height
          timestamp
        }  
      }
    }
  }
`)

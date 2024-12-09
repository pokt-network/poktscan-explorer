import { graphql } from '@/app/config/gql'

export const transactionsPageDocument = graphql(`
  query transactionsList($limit: Int!, $offset: Int!) {
    transactions(
      first: $limit,
      offset: $offset,
      orderBy: BLOCK_BY_BLOCK_ID__HEIGHT_DESC
    ) {
      totalCount
      nodes {
        id
        code
        block {
          timestamp
          height
        }
        gasUsed
        gasWanted
        signerAddress
        fees
        messages {
          nodes {
            typeUrl
            json
          }
        }
      }
    }
  }
`)

export const transactionsSummaryDocument = graphql(`
  query transactionsSummary($startDate: Datetime!, $endDate: Datetime!) {
    blocks(orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        totalTxs
      }
    }
    validTxs: transactions(
      filter: {
        code: { equalTo: 0 }
        block: { timestamp: { greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate} }
      }
    ) {
      totalCount
    }
    failedTxs: transactions(
      filter: {
        code: { notEqualTo: 0 }
        block: { timestamp: { greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate} }
      }
    ) {
      totalCount
    }
  }
`)

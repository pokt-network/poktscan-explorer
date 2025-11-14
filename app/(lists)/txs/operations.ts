import { gql } from '@apollo/client'

export const transactionsPageDocument = gql`
  query transactionsList($limit: Int!, $offset: Int!, $filter: TransactionFilter) {
    transactions(
      first: $limit,
      offset: $offset,
      orderBy: BLOCK_ID_DESC
      filter: $filter
    ) {
      totalCount
      nodes {
        id
        code
        block {
          timestamp
          height: id
        }
        gasUsed
        gasWanted
        signerAddress
        fees
        amountOfMessages
        amountSentByDenom
      }
    }
  }
`

export const transactionsSummaryDocument = gql`
  query transactionsSummary($startDate: Datetime!, $endDate: Datetime!) {
    blocks(orderBy: ID_DESC, first: 1) {
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
`

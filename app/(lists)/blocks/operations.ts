import { gql } from '@apollo/client'

export const blockListDocument = gql`
  query blockList($limit: Int!, $offset: Int!) {
    blocks(first: $limit, offset: $offset, orderBy: ID_DESC) {
      nodes {
        height: id
        hash
        timestamp
        totalTxs
        timeToBlock
        successfulTxs
        stakedApps
        stakedSuppliers
        stakedGateways
        totalRelays
        totalComputedUnits
        proposerAddress
        size
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
      }
      totalCount
    }
  }
`

export const blockSummaryDocument = gql`
  query blockSummary($startDate: Datetime!, $endDate: Datetime!) {
    avgs: blocks(filter: {timestamp: {greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate}}, orderBy: ID_DESC, first: 1) {
      nodes {
        height: id
        totalTxs
      }
      aggregates {
        average {
          timeToBlock
          size
        }
      }
    }
  }
`

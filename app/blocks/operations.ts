import { graphql } from '@/app/config/gql'

export const blockListDocument = graphql(`
  query blockList($limit: Int!, $offset: Int!) {
    blocks(first: $limit, offset: $offset, orderBy: HEIGHT_DESC) {
      nodes {
        id
        height
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
`)

export const blockSummaryDocument = graphql(`
  query blockSummary($startDate: Datetime!, $endDate: Datetime!) {
    avgs: blocks(filter: {timestamp: {greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate}}, orderBy: HEIGHT_DESC, first: 1) {
      nodes {
        height
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
`)

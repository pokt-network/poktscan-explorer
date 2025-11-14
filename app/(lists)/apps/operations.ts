import { gql } from '@apollo/client'

export const applicationListDocument = gql`
  query applicationList($limit: Int!, $offset: Int!, $filter: ApplicationFilter) {
    applications(first: $limit, offset: $offset, filter: $filter) {
      totalCount
      nodes {
        id
        account {
          id
          balances {
            nodes {
              amount
              denom
            }
          }
        }
        stakeAmount
        stakeDenom
        stakeStatus
        services: applicationServices(first: 1) {
          totalCount
          nodes {
            serviceId
          }
        }
        applicationGateways(first: 1) {
          totalCount
          nodes {
            gatewayId
          }
        }
        unstakingBeginBlock {
          height: id
        }
        unstakingEndHeight
        unstakingEndBlock {
          height: id
        }
        unstakingReason
      }
    }
  }
`

export const applicationSummaryDocument = gql`
  query applicationsSummary {
    stakedApps: applications(filter: {stakeStatus: {equalTo: Staked}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    unstakingApps: applications(filter: {stakeStatus: {equalTo: Unstaking}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
  }
`

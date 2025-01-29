import { graphql } from '@/app/config/gql'

export const applicationListDocument = graphql(`
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
        services: applicationServices {
          nodes {
            service {
              id
              name
            }
          }
        }
        applicationGateways {
          nodes {
            gatewayId
          }
        }
        unstakingBeginBlock {
          height
        }
        unstakingEndHeight
        unstakingEndBlock {
          height
        }
        unstakingReason
      }
    }
  }
`)

export const applicationSummaryDocument = graphql(`
  query applicationsSummary {
    stakedApps: applications(filter: {stakeStatus: {equalTo: 0}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    unstakingApps: applications(filter: {stakeStatus: {equalTo: 1}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
  }
`)

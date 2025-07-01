import { graphql } from '@/app/config/gql'

export const supplierListDocument = graphql(`
  query supplierList($limit: Int!, $offset: Int!, $filter: SupplierFilter) {
    suppliers(
      first: $limit,
      offset: $offset,
      filter: $filter
      orderBy: [STAKE_STATUS_ASC]
    ) {
      totalCount
      nodes {
        id
        ownerId
        owner {
          id
          balances(
            filter: {
              denom: {equalTo: "upokt"}
            }
          ) {
            nodes {
              amount
              denom
            }
          }
        }
        operatorId
        operator {
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
        supplierServices: serviceConfigs(
          first: 1
        ) {
          totalCount
          nodes {
            serviceId
          }
        }
      }
    }
  }
`)

export const supplierSummaryDocument = graphql(`
  query supplierSummary {
    stakedSuppliers: suppliers(filter: {stakeStatus: {equalTo: Staked}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    unstakingSuppliers: suppliers(filter: {stakeStatus: {equalTo: Unstaking}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
  }
`)

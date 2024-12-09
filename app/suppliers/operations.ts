import { graphql } from '@/app/config/gql'

export const supplierListDocument = graphql(`
  query supplierList($limit: Int!, $offset: Int!) {
    suppliers(first: $limit, offset: $offset) {
      totalCount
      nodes {
        id
        ownerId
        owner {
          id
          balances {
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
        supplierServices: serviceConfigs {
          nodes {
            service {
              id
              name
            }
          }
        }
      }
    }
  }
`)

export const supplierSummaryDocument = graphql(`
  query supplierSummary {
    stakedSuppliers: suppliers(filter: {stakeStatus: {equalTo: 0}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    unstakingSuppliers: suppliers(filter: {stakeStatus: {equalTo: 1}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
  }
`)

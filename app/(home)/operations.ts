import { graphql } from '@/app/config/gql'

export const summaryDocument = graphql(`
  query summary($currentDate: Datetime!, $last24HourDate: Datetime!, $last7DaysDate: Datetime!) {
    lastBlock: blocks(orderBy: ID_DESC, first: 1) {
      nodes {
        height: id
        totalTxs
        timestamp
        totalRelays
        totalComputedUnits
        stakedApps
        stakedGateways
        stakedSuppliers
        timeToBlock
        stakedSuppliersTokens
        stakedAppsTokens
        stakedGatewaysTokens
        supplies {
          nodes {
            supply {
              denom
              amount
            }
          }
        }
        totalTxs
      }
    }
    blocks(filter: {timestamp: {greaterThanOrEqualTo: $last24HourDate, lessThanOrEqualTo: $currentDate}}) {
      aggregates {
        sum {
          totalRelays
          totalComputedUnits
        }
      }
    }
    groupByDay: blocks(filter: {timestamp: {greaterThanOrEqualTo: $last7DaysDate, lessThanOrEqualTo: $currentDate}}) {
      groupedAggregates(groupBy: TIMESTAMP_TRUNCATED_TO_DAY) {
        keys
        sum {
          totalRelays
          totalComputedUnits
        }
      }
    }
  }
`)

export const evolutionDocument = graphql(`
  query supplierAndAppsEvolution(
    $currentDate: Datetime!,
    $yesterdayDate: Datetime!
    $previous2Date: Datetime!
    $previous3Date: Datetime!
    $previous4Date: Datetime!
    $previous5Date: Datetime!
    $previous6Date: Datetime!
  ) {
    today: blocks(filter: {timestamp: {greaterThanOrEqualTo: $currentDate }}, orderBy: ID_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    yesterday: blocks(filter: {timestamp: {greaterThanOrEqualTo: $yesterdayDate, lessThan: $currentDate }}, orderBy: ID_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last2: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous2Date, lessThan: $yesterdayDate}}, orderBy: ID_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last3: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous3Date, lessThan: $previous2Date}}, orderBy: ID_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last4: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous4Date, lessThan: $previous3Date}}, orderBy: ID_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last5: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous5Date, lessThan: $previous4Date}}, orderBy: ID_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
    last6: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous6Date, lessThan: $previous5Date}}, orderBy: ID_DESC, first: 1) {
      nodes {
        stakedApps
        stakedSuppliers
      }
    }
  }
`)

export const servicesDocument = graphql(`
  query services($currentDate: Datetime!, $last24hDate: Datetime!, $last48hDate: Datetime!) {
    current24h: relayByBlockAndServices(filter: {block: {timestamp: {greaterThanOrEqualTo: $last24hDate, lessThanOrEqualTo: $currentDate}}}) {
      aggregated: groupedAggregates(groupBy: SERVICE_ID) {
        keys
        sum {
          relays
          computedUnits
          amount
          claimedUpokt
        }
      }
    }
    last24h: relayByBlockAndServices(filter: {block: {timestamp: {greaterThanOrEqualTo: $last48hDate, lessThan: $last24hDate}}}) {
      aggregated: groupedAggregates(groupBy: SERVICE_ID) {
        keys
        sum {
          relays
          computedUnits
          amount
          claimedUpokt
        }
      }
    }
  }
`)

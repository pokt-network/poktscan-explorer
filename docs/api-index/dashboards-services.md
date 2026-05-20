# Dashboards: Services

[← Index](README.md)

**Route:** `/dashboards/services`
**Source:** `app/dashboards/services/page.tsx`

## Purpose
Service-level analytics: per-service performance comparison table (current vs previous window), relay-distribution chart, and productivity time-series.

## GraphQL Queries

### `servicesPerformance`
- **File:** `app/dashboards/services/operations.ts`
- **Used for:** Performance table comparing current vs previous period per service.

```graphql
query servicesPerformance($endCurrent: Datetime!, $startCurrentAndEndPrevious: Datetime!, $startPrevious: Datetime!) {
  performance: servicesPerformanceBetweenTimes(
    endCurrent: $endCurrent,
    startCurrentAndEndPrevious: $startCurrentAndEndPrevious,
    startPrevious: $startPrevious
  )
  avgData: getAmountOfBlocksAndSuppliersByTimes(
    startDate: $startCurrentAndEndPrevious
    endDate: $endCurrent
  )
}
```

### `distribution`
- **File:** `app/dashboards/services/operations.ts`
- **Used for:** Distribution chart of computed units per service.

```graphql
query distribution($startDate: Datetime!, $endDate: Datetime!) {
  relayByBlockAndServices(
    filter: {
      block: {
        timestamp: {
          greaterThanOrEqualTo: $startDate
          lessThan: $endDate
        }
      }
    }
  ){
    groupedAggregates(groupBy: SERVICE_ID) {
      keys
      sum {
        computedUnits
        estimatedComputedUnits
      }
    }
  }
}
```

### `servicesProductivity`
- **File:** `app/dashboards/services/operations.ts`
- **Used for:** Productivity time-series chart per service, with supplier-count context.

```graphql
query servicesProductivity($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
  servicesProductivity: getRelaysByServicePerPointJson(
    startTimestamp: $startDate
    endTimestamp: $endDate
    truncInterval: $truncInterval
  )
  suppliersData: getSuppliersStakedAndBlocksByPointJson(
    startTimestamp: $startDate
    endTimestamp: $endDate
    truncInterval: $truncInterval
  )
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

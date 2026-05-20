# Home

[← Index](README.md)

**Route:** `/`
**Source:** `app/page.tsx` -> `app/(home)/Page.tsx`

## Purpose
Landing page. Renders network summary cards, a customizable computed-units chart, evolution charts (validators / apps / suppliers over time, plus supply), and a Services widget with a top-services chart and per-service table.

## GraphQL Queries

### `summary`
- **File:** `app/(home)/operations.ts`
- **Used for:** Network summary cards rendered by `Summary.tsx` (supply, last block, 24h relays / CU).

```graphql
query summary(
  $currentDate: Datetime!,
  $last24HourDate: Datetime!,
  $startCurrentDate: Datetime!,
  $endCurrentDate: Datetime!
) {
  supply: getTotalSupplyByDay(
    startDate: $startCurrentDate,
    endDate: $endCurrentDate,
  )
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
        totalEstimatedRelays
        totalComputedUnits
        totalEstimatedComputedUnits
      }
    }
  }
}
```

### `latestBlockByDay`
- **File:** `app/(home)/operations.ts`
- **Used for:** Evolution chart series — `EvolutionCharts.tsx` (latest block per day and supply per day).

```graphql
query latestBlockByDay($startDate: Datetime!, $endDate: Datetime!) {
  getLatestBlocksByDay(
    startDate: $startDate,
    endDate: $endDate,
  )
  supply: getTotalSupplyByDay(
    startDate: $startDate,
    endDate: $endDate,
  )
}
```

### `supplierAndAppsEvolution`
- **File:** `app/(home)/operations.ts`
- **Used for:** 7-day evolution chart of staked validators / apps / suppliers plus supply.

```graphql
query supplierAndAppsEvolution(
  $currentDate: Datetime!,
  $yesterdayDate: Datetime!
  $previous2Date: Datetime!
  $previous3Date: Datetime!
  $previous4Date: Datetime!
  $previous5Date: Datetime!
  $previous6Date: Datetime!
  $supplyStartDate: Datetime!
  $supplyEndDate: Datetime!
) {
  supply: getTotalSupplyByDay(
    startDate: $supplyStartDate,
    endDate: $supplyEndDate,
  )
  today: blocks(filter: {timestamp: {greaterThanOrEqualTo: $currentDate }}, orderBy: ID_DESC, first: 1) {
    nodes {
      stakedValidators
      stakedApps
      stakedSuppliers
    }
  }
  yesterday: blocks(filter: {timestamp: {greaterThanOrEqualTo: $yesterdayDate, lessThan: $currentDate }}, orderBy: ID_DESC, first: 1) {
    nodes {
      stakedValidators
      stakedApps
      stakedSuppliers
    }
  }
  last2: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous2Date, lessThan: $yesterdayDate}}, orderBy: ID_DESC, first: 1) {
    nodes {
      stakedValidators
      stakedApps
      stakedSuppliers
    }
  }
  last3: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous3Date, lessThan: $previous2Date}}, orderBy: ID_DESC, first: 1) {
    nodes {
      stakedValidators
      stakedApps
      stakedSuppliers
    }
  }
  last4: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous4Date, lessThan: $previous3Date}}, orderBy: ID_DESC, first: 1) {
    nodes {
      stakedValidators
      stakedApps
      stakedSuppliers
    }
  }
  last5: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous5Date, lessThan: $previous4Date}}, orderBy: ID_DESC, first: 1) {
    nodes {
      stakedValidators
      stakedApps
      stakedSuppliers
    }
  }
  last6: blocks(filter: {timestamp: {greaterThanOrEqualTo: $previous6Date, lessThan: $previous5Date}}, orderBy: ID_DESC, first: 1) {
    nodes {
      stakedValidators
      stakedApps
      stakedSuppliers
    }
  }
}
```

### `services`
- **File:** `app/(home)/operations.ts`
- **Used for:** "Services" card — current vs previous 24h aggregates per service (`ServicesCard.tsx`).

```graphql
query services($currentDate: Datetime!, $last24hDate: Datetime!, $last48hDate: Datetime!) {
  current24h: relayByBlockAndServices(filter: {block: {timestamp: {greaterThanOrEqualTo: $last24hDate, lessThanOrEqualTo: $currentDate}}}) {
    aggregated: groupedAggregates(groupBy: SERVICE_ID) {
      keys
      sum {
        relays
        estimatedRelays
        computedUnits
        estimatedComputedUnits
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
        estimatedRelays
        computedUnits
        estimatedComputedUnits
        amount
        claimedUpokt
      }
    }
  }
}
```

### `customizableCompUnits`
- **File:** `app/(home)/CustomizableCompUnitsChart/operations.ts`
- **Used for:** Customizable rewards chart, bucketed by a user-chosen interval.

```graphql
query customizableCompUnits($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
  groupByDay: getRewardsByDate(
    startDate: $startDate,
    endDate: $endDate,
    truncInterval: $truncInterval,
  )
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).
- Search bar uses all `searchBy*` queries.

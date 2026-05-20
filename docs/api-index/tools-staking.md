# Tools: Staking

[← Index](README.md)

**Route:** `/tools/staking`
**Source:** `app/tools/staking/page.tsx` (inside `app/tools/staking/layout.tsx` -> `SupplierLayout`)

## Purpose
Filters the global Suppliers list by a comma-separated list of owner addresses (from URL or cookie). The page itself only renders `SuppliersTable`; the surrounding `SupplierLayout` adds the stake-and-rewards summary header.

## GraphQL Queries

The page has no local operations file. All page-level data comes from the shared `SuppliersTable` and from `SupplierLayout`'s embedded `SummaryAndRewards` block.

## Embedded `SupplierLayout` queries

### `nodesSummary`
- **File:** `app/tools/Summary/operations.ts`
- **Used for:** Header summary cards — staked supplier totals plus 24h and 48h reward sums, filtered to owner or rev-share addresses.

```graphql
query nodesSummary(
  $filter: SupplierFilter!,
  $addresses: [String!]!,
  $currentDate: Datetime!,
  $last24Hours: Datetime!,
  $last48Hours: Datetime!
) {
  suppliers(
    filter: $filter
  ) {
    totalCount
    aggregates {
      sum {
        stakeAmount
      }
    }
  }
  last24h: getRewardsByAddressesAndTime(
    addresses: $addresses,
    startDate: $last24Hours,
    endDate: $currentDate,
  )

  last48h: getRewardsByAddressesAndTime(
    addresses: $addresses,
    startDate: $last48Hours,
    endDate: $currentDate,
  )
}
```

### `getRewardsByAddressesAndTimeGroupByAddressAndDate`
- **File:** `app/tools/RewardsByAddresses/operations.ts`
- **Used for:** Rewards-per-address-per-day chart inside `SummaryAndRewards`.

```graphql
query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
  rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(
    addresses: $addresses, 
    startDate: $startDate, 
    endDate: $endDate, 
    truncInterval: $truncInterval
  )
}
```

## Shared queries used
- `supplierList`, `paramsForSupplierFilters` via `SuppliersTable`.
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

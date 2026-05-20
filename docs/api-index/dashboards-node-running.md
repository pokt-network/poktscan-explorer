# Dashboards: Node Running

[← Index](README.md)

**Route:** `/dashboards/node-running`
**Source:** `app/dashboards/node-running/page.tsx`

## Purpose
Network-wide claim/proof time-series chart for node runners. Not scoped to specific addresses.

## GraphQL Queries

### `claimProofDataByTime`
- **File:** `app/dashboards/node-running/operations.ts`
- **Used for:** Comparison chart — network-wide claims vs proofs over time.

```graphql
query claimProofDataByTime(
  $startDate: Datetime!
  $endDate: Datetime!
  $truncInterval: String!
) {
  data: getClaimProofsDataByTime(
    startTs: $startDate,
    endTs: $endDate,
    truncInterval: $truncInterval
  )
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

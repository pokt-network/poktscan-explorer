# List: Blocks

[← Index](README.md)

**Route:** `/blocks`
**Source:** `app/(lists)/blocks/page.tsx`

## Purpose
Paginated list of recent blocks with summary cards (last block, 24h tx count, 24h average production time and size).

## GraphQL Queries

### `blockList`
- **File:** `app/(lists)/blocks/operations.ts`
- **Used for:** Block table rows.

```graphql
query blockList($limit: Int!, $offset: Int!) {
  blocks(first: $limit, offset: $offset, orderBy: ID_DESC) {
    nodes {
      height: id
      hash
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
```

### `blockSummary`
- **File:** `app/(lists)/blocks/operations.ts`
- **Used for:** Latest block plus 24h aggregates (average `timeToBlock` and `size`).

```graphql
query blockSummary($startDate: Datetime!, $endDate: Datetime!) {
  avgs: blocks(filter: {timestamp: {greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate}}, orderBy: ID_DESC, first: 1) {
    nodes {
      height: id
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
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

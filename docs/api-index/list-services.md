# List: Services

[← Index](README.md)

**Route:** `/services`
**Source:** `app/(lists)/services/page.tsx`

## Purpose
Paginated list of all services, with application and supplier counts and the current relay mining difficulty.

## GraphQL Queries

### `serviceList`
- **File:** `app/(lists)/services/operations.ts`
- **Used for:** Services table.

```graphql
query serviceList($limit: Int!, $offset: Int!) {
  services(first: $limit, offset: $offset) {
    totalCount
    nodes {
      id
      name
      computeUnitsPerRelay
      ownerId
      apps: applicationServices {
        totalCount
      }
      suppliers: supplierServiceConfigs {
        totalCount
      }
      relayMiningDifficultyUpdatedEvents(
        orderBy: BLOCK_ID_DESC
        first: 1
      ) {
        nodes {
          newNumRelaysEma
        }
      }
    }
  }
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

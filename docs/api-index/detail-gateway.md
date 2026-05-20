# Detail: Gateway

[← Index](README.md)

**Route:** `/gateway/[id]`
**Source:** `app/(details)/gateway/[id]/page.tsx` -> `PageClient.tsx`

## Purpose
Gateway detail with a stake / balance card, an "Apps Delegated" tab, and tabs for transactions, transfers, and raw.

## GraphQL Queries

### `gatewayById`
- **File:** `app/(details)/gateway/[id]/operations.ts`
- **Used for:** Detail card.

```graphql
query gatewayById($id: String!) {
  gateway(id: $id) {
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
    unstakingEndHeight
    unstakingBeginBlock {
      height: id
    }
    unstakingEndBlock {
      height: id
    }
  }
}
```

## Non-GraphQL sources
- `getGateway.ts` falls back to the Cosmos LCD when the indexer is behind.

## Shared queries used
- "Apps Delegated" tab embeds `AppsTable` (filtered by gateway) — uses `applicationList` and `paramsForAppsFilters`.
- `transactionsByAddress`, `transfersList` for the Transactions and Transfers tabs — see [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

# Detail: Account

[← Index](README.md)

**Route:** `/account/[id]`
**Source:** `app/(details)/account/[id]/page.tsx` -> `PageClient.tsx`

## Purpose
Account detail view with balances, plus tabs for transactions, transfers, raw, and (when applicable) migration.

## GraphQL Queries

### `accountById`
- **File:** `app/(details)/account/[id]/operations.ts`
- **Used for:** Detail card — balances and last-updated metadata.

```graphql
query accountById($id: String!) {
  account(id: $id) {
    id
    balances {
      nodes {
        amount
        denom
        lastUpdatedBlock {
          height: id
          timestamp
        }
      }
    }
  }
}
```

## Non-GraphQL sources
- `getAccount.ts` falls back to the Cosmos LCD when the indexer is behind (decided via `metadata`).

## Shared queries used
- `transactionsByAddress`, `transfersList` for the Transactions and Transfers tabs — see [`_shared.md`](./_shared.md).
- Migration tab uses `morseClaimableAccountsList` (see [`migration.md`](./migration.md)).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

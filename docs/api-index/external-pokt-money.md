[← Index](README.md)

# External plain-text endpoints (pokt-money)

These are **not** part of the explorer app. They live in the separate `pokt-money` repo (`money.pocket.network`) and are exposed as Next.js route handlers under `app/api/`. Each one returns a single numeric string (not JSON, not HTML) with `Content-Type: text/plain`. They are intended for external consumers such as CoinGecko / CoinMarketCap supply trackers.

Both endpoints run their GraphQL query against the same indexer the explorer uses, then post-process the result server-side. The returned number is in **POKT** (the raw `upokt` amount divided by `1e6`).

## `GET /api/total_supply`

- **Repo / file:** `pokt-money` → `app/api/total_supply/route.ts`
- **Returns:** `text/plain` — a single POKT amount as a string.
- **Formula:** `networkSupply + unmigratedSupply`, divided by `1e6`.
  - `networkSupply`: `upokt` supply of the latest block.
  - `unmigratedSupply`: sum of `applicationStakeAmount + supplierStakeAmount + unstakedBalanceAmount` across all `morseClaimableAccounts` with `claimed = false`.

```graphql
query totalSupply {
  blocks(orderBy: ID_DESC, first: 1) {
    nodes {
      id
      supplies(filter: {supply: {denom: {equalTo: "upokt"}}}) {
        nodes {
          supply {
            amount
          }
        }
      }
    }
  }
  morseClaimableAccounts(filter: {claimed: {equalTo: false}}) {
    aggregates {
      sum {
        supplierStakeAmount
        applicationStakeAmount
        unstakedBalanceAmount
      }
    }
  }
}
```

## `GET /api/circulating_supply`

- **Repo / file:** `pokt-money` → `app/api/circulating_supply/route.ts`
- **Returns:** `text/plain` — a single POKT amount as a string.
- **Formula:** same as `total_supply`, but **subtracts the DAO balance** (`getDaoBalanceAtHeight`) before dividing by `1e6`.

```graphql
query circulatingSupply {
  blocks(orderBy: ID_DESC, first: 1) {
    nodes {
      id
      supplies(filter: {supply: {denom: {equalTo: "upokt"}}}) {
        nodes {
          supply {
            amount
          }
        }
      }
    }
  }
  morseClaimableAccounts(filter: {claimed: {equalTo: false}}) {
    aggregates {
      sum {
        supplierStakeAmount
        applicationStakeAmount
        unstakedBalanceAmount
      }
    }
  }
  dao: getDaoBalanceAtHeight
}
```

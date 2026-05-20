# Detail: Application

[← Index](README.md)

**Route:** `/app/[id]`
**Source:** `app/(details)/app/[id]/page.tsx` -> `PageClient.tsx`

## Purpose
Application detail with stake and account info, services, plus tabs for transactions, transfers, "Delegated To" gateways, and raw.

## GraphQL Queries

### `appById`
- **File:** `app/(details)/app/[id]/operations.ts`
- **Used for:** Detail card.

```graphql
query appById($id: String!) {
  application(id: $id) {
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
    unstakingEndBlock {
      height: id
    }
    unstakingBeginBlock {
      height: id
    }
    unstakingEndHeight
    services: applicationServices {
      nodes {
        serviceId
      }
    }
    transferEndBlock {
      height: id
    }
    sourceApplicationId
    transferredFromAt {
      height: id
    }
    destinationApplicationId
    transferringToId
    transferEndHeight
  }
}
```

### `getDelegatedTo`
- **File:** `app/(details)/app/[id]/operations.ts`
- **Used for:** Cursor-paginated lookup of gateways the app has delegated to. Enriches the "Delegated To" tab and mirrors what RPC returns.

```graphql
query getDelegatedTo($id: String!, $cursor: Cursor!) {
  applicationGateways(filter: {applicationId: {equalTo: $id}}, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      gateway {
        id
        stakeAmount
        stakeDenom
      }
    }
  }
}
```

## Non-GraphQL sources
- `getApp.ts` falls back to the Cosmos LCD when the indexer is behind.

## Shared queries used
- "Delegated To" tab embeds `GatewaysTable` (filtered by application) — uses `gatewayList`.
- `transactionsByAddress`, `transfersList` for the Transactions and Transfers tabs — see [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

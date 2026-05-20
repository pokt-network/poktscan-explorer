# Detail: Block

[← Index](README.md)

**Route:** `/block/[id]` (id may be height or hash)
**Source:** `app/(details)/block/[id]/page.tsx` -> `Tabs.tsx`

## Purpose
Block detail with a summary card, a metadata / signatures tab, and a transactions-at-height tab.

## GraphQL Queries

### `blockByHeight`
- **File:** `app/(details)/block/[id]/getBlock.ts`
- **Used for:** Indexer fetch when `id` is numeric.

```graphql
query blockByHeight($height: BigFloat!) {
  block(id: $height) {
    hash
    height: id
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
    stakedAppsTokens
    stakedSuppliersTokens
    stakedGatewaysTokens
    size
    supplies {
      nodes {
        supply {
          denom
          amount
        }
      }
    }
    metadata {
      header
      lastCommit
      blockId
    }
  }
}
```

### `blockByHash`
- **File:** `app/(details)/block/[id]/getBlock.ts`
- **Used for:** Indexer fetch when `id` is a hash.

```graphql
query blockByHash($hash: String!) {
  blocks(
    filter: {
      hash: { equalTo: $hash }
    }
    first: 1
  ) {
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
      stakedAppsTokens
      stakedSuppliersTokens
      stakedGatewaysTokens
      size
      supplies {
        nodes {
          supply {
            denom
            amount
          }
        }
      }
      metadata {
        header
        lastCommit
        blockId
      }
    }
  }
}
```

## Non-GraphQL sources
- `getBlock.ts` falls back to `getBlockFromRpc` (Tendermint RPC) when the indexer is behind (decided via `metadata`).

## Shared queries used
- Transactions tab: `transactionsByHeight` — see [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

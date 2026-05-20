# Shared Queries

[← Index](README.md)

Queries defined in shared components, contexts, and the global search bar that are reused across many pages. Per-page docs reference these by name instead of redocumenting them.

## Indexer status

### `status`
- **File:** `app/operations/block.ts`
- **Used by:** `app/context/height.tsx` — `HeightContextProvider` polls every 15s.
- **Used for:** Drives the global "current block / network height / session height" context. Powers the live block badge in the app bar and most "refresh on new block" behavior.

```graphql
query status {
  blocks(orderBy: ID_DESC, first: 1) {
    nodes {
      id
      timestamp
      totalRelays
    }
  }
  _metadata {
    targetHeight
    lastProcessedHeight
  }
}
```

### `latestBlock`
- **File:** `app/operations/block.ts`
- **Used by:** SSR layout (`app/layout.tsx` via `app/api/blocks.ts#getLatestBlock`) and the home `LatestBlock` card.
- **Used for:** Rich snapshot of the latest produced block for SSR hydration and the homepage card.

```graphql
query latestBlock {
  blocks(orderBy: ID_DESC, first: 1) {
    nodes {
      hash
      height: id
      timestamp
      totalTxs
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
      totalComputedUnits
      totalRelays
      failedTxs
      successfulTxs
      totalTxs
      stakedSuppliers
      stakedSuppliersTokens
      unstakingSuppliers
      unstakingSuppliersTokens
      timeToBlock
      unstakedSuppliers
      unstakedSuppliersTokens
      stakedApps
      stakedAppsTokens
      unstakingApps
      unstakingAppsTokens
      unstakedApps
      unstakedAppsTokens
      stakedGateways
      stakedGatewaysTokens
      unstakedGateways
      unstakedGatewaysTokens
    }
  }
}
```

### `numBlocksPerSession`
- **File:** `app/operations/block.ts`
- **Used by:** `app/api/blocks.ts` — fetched server-side and threaded through the layout for session-relative UI.
- **Used for:** Returns the shared param `num_blocks_per_session`.

```graphql
query numBlocksPerSession {
  params(
    filter:  {
      key:  {
        equalTo: "num_blocks_per_session"
      }
      namespace:  {
        equalTo: "shared"
      }
    }
    orderBy: [BLOCK_ID_DESC]
    first: 1
  ) {
    nodes {
      blockId
      key
      namespace
      value
    }
  }
}
```

### `metadata`
- **File:** `app/operations/metadata.ts`
- **Used by:** Search, supplier/app delegated tabs, block metadata tab, validator uptime — anywhere the UI decides whether to fall back to RPC because the indexer is behind.
- **Used for:** `_metadata` (targetHeight, lastProcessed*, indexerHealthy). `getUseRpcData()` reads this to choose indexer vs RPC.

```graphql
query metadata {
  _metadata {
    targetHeight
    lastFinalizedVerifiedHeight
    lastProcessedHeight
    lastProcessedTimestamp
    indexerHealthy
  }
}
```

## Search (top bar)

Source: `app/Search/SearchContent.tsx`. Used by the global search input present in the layout on every page.

### `searchByAddress`
- **File:** `app/Search/SearchContent.tsx`
- **Used for:** Resolves a bech32 address to account / supplier / app / gateway with stake info.

```graphql
query searchByAddress($address: String!) {
  account(id: $address) {
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
  supplier(id: $address) {
    id
    stakeStatus
    stakeAmount
    stakeDenom
  }
  application(id: $address) {
    id
    stakeStatus
    stakeAmount
    stakeDenom
  }
  gateway(id: $address) {
    id
    stakeStatus
    stakeAmount
    stakeDenom
  }
}
```

### `searchValidatorByAddress`
- **File:** `app/Search/SearchContent.tsx`
- **Used for:** Resolves a `poktvaloper…` address to a validator row.

```graphql
query searchValidatorByAddress($address: String!) {
  validator(id: $address) {
    id
    stakeAmount
    stakeDenom
    stakeStatus
  }
}
```

### `searchByHash`
- **File:** `app/Search/SearchContent.tsx`
- **Used for:** Resolves a 64-char hex hash to a block or a transaction.

```graphql
query searchByHash($hash: String!) {
  blocks(filter: {hash: {equalTo: $hash}}, first: 1) {
    nodes {
      hash
      height: id
      timestamp
      totalTxs
    }
  }
  transaction(id: $hash) {
    id
    code
    amountOfMessages
  }
}
```

### `searchByHeight`
- **File:** `app/Search/SearchContent.tsx`
- **Used for:** Resolves a numeric input to a block by height.

```graphql
query searchByHeight($height: BigFloat!) {
  block(id: $height) {
    height: id
    hash
    timestamp
    totalTxs
  }
}
```

### `searchServices`
- **File:** `app/Search/SearchContent.tsx`
- **Used for:** Free-text fuzzy match against service id and name.

```graphql
query searchServices($text: String!) {
  services(
    filter: {
      or: [
        {
          id: {
            includesInsensitive: $text
          }
        },
        {
          name: {
            includesInsensitive: $text
          }
        }
      ]
    }
  ){
    nodes {
      id
      name
    }
  }
}
```

## Transaction tabs (shared by detail pages)

Source: `app/(transactions)/*`. Embedded by every address-based detail page through `TransferAndTxTabs`, and by block detail through `TransactionByHeight`.

### `transactionsByAddress`
- **File:** `app/(transactions)/TransactionsByAddress.tsx`
- **Used for:** "Transactions" tab on account / supplier / app / gateway / validator detail pages. Lists transactions signed by, or relating to, the address.

```graphql
query transactionsByAddress($limit: Int!, $offset: Int!, $filter: TransactionFilter) {
  transactions(
    first: $limit
    offset: $offset
    filter: $filter
    orderBy: BLOCK_ID_DESC
  ) {
    totalCount
    nodes {
      id
      code
      block {
        timestamp
        height: id
      }
      gasUsed
      gasWanted
      signerAddress
      fees
      amountOfMessages
      amountSentByDenom
    }
  }
}
```

### `transactionsByHeight`
- **File:** `app/(transactions)/TransactionByHeight.tsx`
- **Used for:** "Transactions" tab on the block detail page.

```graphql
query transactionsByHeight($limit: Int!, $offset: Int!, $filter: TransactionFilter) {
  transactions(
    first: $limit
    offset: $offset
    filter: $filter
    orderBy: BLOCK_ID_DESC
  ) {
    totalCount
    nodes {
      id
      code
      block {
        timestamp
        height: id
      }
      gasUsed
      gasWanted
      signerAddress
      fees
      amountOfMessages
      amountSentByDenom
    }
  }
}
```

### `transfersList`
- **File:** `app/(transactions)/TransferTable.tsx`
- **Used for:** "Transfers" tab on address-based detail pages — native `MsgSend` transfers where the address is sender or recipient.

```graphql
query transfersList($limit: Int!, $offset: Int!, $address: String!) {
  transfers:nativeTransfers(
    first: $limit
    offset: $offset
    orderBy: BLOCK_ID_DESC
    filter: {
      or: [{ senderId: { equalTo: $address } }, { recipientId: { equalTo: $address } }]
    }
  ) {
    totalCount
    nodes {
      id
      senderId
      recipientId
      amounts
      denom
      block {
        height: id
        timestamp
      }
      transaction {
        id
        fees
        gasUsed
        gasWanted
        code
        codespace
      }
    }
  }
}
```

## Table filter helpers

### `paramsForSupplierFilters`
- **File:** `app/components/SuppliersTable/SuppliersTable.tsx`
- **Used for:** Reads `supplier.min_stake` and `proof.proof_missing_penalty` params to compute the "Low Stake" / "Below Min Stake" client-side filters anywhere `SuppliersTable` is rendered.

```graphql
query paramsForSupplierFilters {
  params(
    orderBy: [BLOCK_ID_DESC]
    distinct: [NAMESPACE, KEY]
    filter:  {
      or: [
        {
          namespace:  {
            equalTo: "supplier"
          }
          key: {
            equalTo: "min_stake"
          }
        },
        {
          namespace:  {
            equalTo: "proof"
          }
          key:  {
            equalTo: "proof_missing_penalty"
          }
        }
      ]
    }
  ) {
    nodes {
      key
      value
    }
  }
}
```

### `paramsForAppsFilters`
- **File:** `app/components/AppsTable/AppsTable.tsx`
- **Used for:** Reads `application.min_stake` to compute the "Low Stake" filter anywhere `AppsTable` is rendered.

```graphql
query paramsForAppsFilters {
  param(id: "application-min_stake") {
    key
    value
  }
}
```

## Reusable list documents

Defined in list-page sources but also imported by shared table components and detail tabs.

### `supplierList`
- **File:** `app/(lists)/suppliers/operations.ts`
- **Used by:** `SuppliersTable` (suppliers list, tools/operator, tools/staking, service detail "Suppliers" tab).

```graphql
query supplierList($limit: Int!, $offset: Int!, $filter: SupplierFilter) {
  suppliers(
    first: $limit,
    offset: $offset,
    filter: $filter
    orderBy: [STAKE_STATUS_ASC]
  ) {
    totalCount
    nodes {
      id
      ownerId
      owner {
        id
        balances(
          filter: {
            denom: {equalTo: "upokt"}
          }
        ) {
          nodes {
            amount
            denom
          }
        }
      }
      operatorId
      operator {
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
      supplierServices: serviceConfigs(
        first: 1
      ) {
        totalCount
        nodes {
          serviceId
        }
      }
    }
  }
}
```

### `applicationList`
- **File:** `app/(lists)/apps/operations.ts`
- **Used by:** `AppsTable` (apps list, service detail "Apps" tab, gateway detail "Apps Delegated").

```graphql
query applicationList($limit: Int!, $offset: Int!, $filter: ApplicationFilter) {
  applications(first: $limit, offset: $offset, filter: $filter) {
    totalCount
    nodes {
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
      services: applicationServices(first: 1) {
        totalCount
        nodes {
          serviceId
        }
      }
      applicationGateways(first: 1) {
        totalCount
        nodes {
          gatewayId
        }
      }
      unstakingBeginBlock {
        height: id
      }
      unstakingEndHeight
      unstakingEndBlock {
        height: id
      }
      unstakingReason
    }
  }
}
```

### `gatewayList`
- **File:** `app/components/GatewaysTable/GatewaysTable.tsx` (defined inline in the table component)
- **Used by:** `GatewaysTable` (gateways list, app detail "Delegated To" tab, service detail "Gateways" tab).

```graphql
query gatewayList($limit: Int!, $offset: Int!, $filter: GatewayFilter) {
  gateways(first: $limit, offset: $offset, filter: $filter) {
    totalCount
    nodes {
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
      unstakingBeginBlock {
        height: id
      }
      unstakingEndBlock {
        height: id
      }
      applications: applicationGateways(first: 1) {
        totalCount
        nodes {
          applicationId
        }
      }
    }
  }
  stakedGateways: gateways(filter: {stakeStatus: {equalTo: Staked}}) {
    totalCount
    aggregates {
      sum {
        stakeAmount
      }
    }
  }
}
```

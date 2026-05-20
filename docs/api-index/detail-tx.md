# Detail: Transaction

[← Index](README.md)

**Route:** `/tx/[id]`
**Source:** `app/(details)/tx/[id]/page.tsx` -> `Tabs.tsx`

## Purpose
Transaction detail with a header (status, height, signer, fees) and tabs for Messages, Events, and Raw.

## GraphQL Queries

### `transaction`
- **File:** `app/(details)/tx/[id]/getTx.ts`
- **Used for:** Indexer fetch of transaction by hash for the detail header.

```graphql
query transaction($id: String!) {
  transaction(id: $id) {
    id
    code
    codespace
    block {
      timestamp
      height: id
    }
    gasUsed
    gasWanted
    signerAddress
    fees
    memo
    isMultisig
    multisig
    amountSentByDenom
  }
}
```

## Non-GraphQL sources
- Messages and Events tabs are sourced from Cosmos LCD (`/cosmos/tx/v1beta1/txs/{hash}`), parsed in `getTx.ts`.
- The detail header itself falls back to the same RPC endpoint when the indexer is behind.

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md). `metadata` decides indexer vs RPC.

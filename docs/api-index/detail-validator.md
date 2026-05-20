# Detail: Validator

[← Index](README.md)

**Route:** `/validator/[id]`
**Source:** `app/(details)/validator/[id]/page.tsx` -> `PageClient.tsx`

## Purpose
Validator detail with description, commission, stake, and signer balance. Tabs: Delegators (RPC), Uptime (recent produced vs missed blocks), Transactions, Transfers, and Raw.

## GraphQL Queries

### `validatorById`
- **File:** `app/(details)/validator/[id]/operations.ts`
- **Used for:** Detail card.

```graphql
query validatorById($id: String!) {
  validator(id: $id) {
    id
    signerId
    description
    commission
    minSelfDelegation
    stakeDenom
    stakeAmount
    stakeStatus
    signer {
      id
      balances {
        nodes {
          amount
          denom
        }
      }
    }
  }
}
```

### `validatorUptime`
- **File:** `app/(details)/validator/[id]/Uptime/operations.ts`
- **Used for:** Uptime tab — produced vs missed blocks since a starting height.

```graphql
query validatorUptime($from: BigInt!, $validatorHexAddress: String!) {
  producedBlocks: getProducedBlocksByValidator(
    fromId: $from
    validatorAddress: $validatorHexAddress
  )
  missedBlocks: getMissingValidatorBlocks(
    fromId: $from
    validatorAddress: $validatorHexAddress
  )
}
```

## Non-GraphQL sources
- `getValidator.ts` falls back to the Cosmos LCD when the indexer is behind.
- Delegators tab is RPC-only: `/cosmos/staking/v1beta1/validators/{valoper}/delegations`.

## Shared queries used
- `transactionsByAddress`, `transfersList` for the Transactions and Transfers tabs — see [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md). Uptime windowing also reads `metadata` to choose its starting height.

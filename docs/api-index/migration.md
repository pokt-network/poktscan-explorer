# Morse Migration

[← Index](README.md)

**Route:** `/migration`
**Source:** `app/migration/page.tsx`

## Purpose
Tracks Morse → Shannon claimable accounts: a summary of total claimed and unclaimed stake plus a searchable, paginated table.

## GraphQL Queries

### `morseClaimableAccountsList`
- **File:** `app/migration/operations.ts`
- **Used for:** `Table.tsx` — paginated list of Morse claimable accounts with claim status and destination.

```graphql
query morseClaimableAccountsList($limit: Int!, $offset: Int!, $filter: MorseClaimableAccountFilter) {
  morseClaimableAccounts(
    first: $limit,
    offset: $offset,
    filter: $filter,
    orderBy: [CLAIMED_DESC, CLAIMED_AT_ID_DESC],
  ) {
    totalCount
    nodes {
      # morseSrcAddress
      id

      shannonDestAddress
      claimed
      claimedAtHeight: claimedAtId
      transactionId

      unstakedBalanceAmount
      unstakedBalanceDenom

      supplierStakeAmount
      supplierStakeDenom

      applicationStakeAmount
      applicationStakeDenom
    }
  } 
}
```

### `morseClaimableAccountsSummary`
- **File:** `app/migration/operations.ts`
- **Used for:** `Summary.tsx` — four cards (Total Claimed, Claimed Liquid, Claimed Supplier Stake, Claimed App Stake).

```graphql
query morseClaimableAccountsSummary {
  morseClaimableAccounts {
    groupedAggregates(groupBy: CLAIMED) {
      keys
      sum {
        applicationStakeAmount
        supplierStakeAmount
        unstakedBalanceAmount
      }
    }
  }
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

# Tools: Operator

[← Index](README.md)

**Route:** `/tools/operator`
**Source:** `app/tools/operator/page.tsx` (inside `app/tools/operator/layout.tsx` -> `SupplierLayout`)

## Purpose
Analytics dashboard for node operators, scoped to a list of addresses. Tabbed UI with Claim/Proof comparison, Rewards by Service, Overserviced, Slashing, and the operator's Suppliers list. The surrounding `SupplierLayout` also renders a stake-and-rewards summary header.

## GraphQL Queries

### `getDataByDelegatorAddressesAndTimes`
- **File:** `app/tools/operator/operations.ts`
- **Used for:** Server-side rollup of operator metrics for a time window. Powers the Claim/Proof comparison summary numbers and shared header data.

```graphql
query getDataByDelegatorAddressesAndTimes(
  $delegatorAddresses: [String!]!
  $startTime: Datetime!
  $endTime: Datetime!
) {
  data: getDataByDelegatorAddressesAndTimes(
    addresses: $delegatorAddresses,
    startTs: $startTime,
    endTs: $endTime
  )
}
```

### `getDataByDelegatorAddressesAndBlocks`
- **File:** `app/tools/operator/operations.ts`
- **Used for:** Same rollup bounded by a height range — used by the "Last Claiming Window" table.

```graphql
query getDataByDelegatorAddressesAndBlocks(
  $delegatorAddresses: [String!]!
  $startBlock: BigInt!
  $endBlock: BigInt!
) {
  data: getDataByDelegatorAddressesAndBlocks(
    addresses: $delegatorAddresses,
    startHeight: $startBlock,
    endHeight: $endBlock
  )
}
```

### `getParams`
- **File:** `app/tools/operator/operations.ts`
- **Used for:** Reads `shared` claim/proof window offsets to convert "last claiming window" into a concrete block range.

```graphql
query getParams {
  params(
    filter: {
      namespace: {
        equalTo: "shared"
      },
      key: {
        in: ["claim_window_open_offset_blocks", "claim_window_close_offset_blocks", "proof_window_close_offset_blocks"]
      }
    }
    orderBy: [BLOCK_ID_DESC]
    distinct: [NAMESPACE, KEY]
  ) {
    nodes {
      key
      value
      blockId
    }
  }
}
```

### `claimProofData`
- **File:** `app/tools/operator/operations.ts`
- **Used for:** Time-series chart of claims vs proofs for the given addresses.

```graphql
query claimProofData(
  $addresses: [String!]!
  $startDate: Datetime!
  $endDate: Datetime!
  $truncInterval: String!
) {
  data: getClaimProofsDataByDelegatorsAndTime(
    addresses: $addresses,
    startTs: $startDate,
    endTs: $endDate,
    truncInterval: $truncInterval
  )
}
```

### `slashedItems`
- **File:** `app/tools/operator/operations.ts`
- **Used for:** Slashing tab — paginated list of `EventSupplierSlashed` for the operator.

```graphql
query slashedItems($limit: Int!, $offset: Int!, $filter: EventSupplierSlashedFilter!) {
  eventSupplierSlasheds(
    orderBy: [BLOCK_ID_DESC, SUPPLIER_ID_DESC]
    filter: $filter
    first: $limit,
    offset: $offset,
  ) {
    totalCount
    nodes {
      supplierId
      blockId
      proofValidationStatus
      proofMissingPenalty
      previousStakeAmount
      afterStakeAmount
      sessionId
      serviceId
      applicationId
    }
  }
}
```

### `rewardsByServices`
- **File:** `app/tools/operator/operations.ts`
- **Used for:** Rewards by Service tab.

```graphql
query rewardsByServices(
  $delegatorAddresses: [String!]!
  $startTime: Datetime!
  $endTime: Datetime!
) {
  data: getRewardsByAddressesAndTimeGroupByService(
    addresses: $delegatorAddresses,
    startTs: $startTime,
    endTs: $endTime
  )
}
```

### `overservicedByAddressesAndTime`
- **File:** `app/tools/operator/operations.ts`
- **Used for:** Overserviced tab chart.

```graphql
query overservicedByAddressesAndTime(
  $addresses: [String!]!
  $startDate: Datetime!
  $endDate: Datetime!
  $truncInterval: String!
) {
  data: getOverservicedByAddressesAndTime(
    addresses: $addresses,
    startTs: $startDate,
    endTs: $endDate,
    truncInterval: $truncInterval
  )
}
```

## Embedded `SupplierLayout` queries

The shared `SummaryAndRewards` block (inside `SupplierLayout`) issues:

### `nodesSummary`
- **File:** `app/tools/Summary/operations.ts`
- **Used for:** Header summary cards — staked supplier totals plus 24h and 48h reward sums, filtered to owner or rev-share addresses.

```graphql
query nodesSummary(
  $filter: SupplierFilter!,
  $addresses: [String!]!,
  $currentDate: Datetime!,
  $last24Hours: Datetime!,
  $last48Hours: Datetime!
) {
  suppliers(
    filter: $filter
  ) {
    totalCount
    aggregates {
      sum {
        stakeAmount
      }
    }
  }
  last24h: getRewardsByAddressesAndTime(
    addresses: $addresses,
    startDate: $last24Hours,
    endDate: $currentDate,
  )

  last48h: getRewardsByAddressesAndTime(
    addresses: $addresses,
    startDate: $last48Hours,
    endDate: $currentDate,
  )
}
```

### `getRewardsByAddressesAndTimeGroupByAddressAndDate`
- **File:** `app/tools/RewardsByAddresses/operations.ts`
- **Used for:** Rewards-per-address-per-day chart inside `SummaryAndRewards`.

```graphql
query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
  rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(
    addresses: $addresses, 
    startDate: $startDate, 
    endDate: $endDate, 
    truncInterval: $truncInterval
  )
}
```

## Shared queries used
- `supplierList`, `paramsForSupplierFilters` via `SuppliersTable` for the Suppliers tab.
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

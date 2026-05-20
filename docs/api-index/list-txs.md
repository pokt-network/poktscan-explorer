# List: Transactions

[← Index](README.md)

**Route:** `/txs`
**Source:** `app/(lists)/txs/page.tsx`

## Purpose
Paginated, filterable list of transactions with summary cards (total tx count and successful / failed counts in the time window).

## GraphQL Queries

### `transactionsList`
- **File:** `app/(lists)/txs/operations.ts`
- **Used for:** Transaction table rows.

```graphql
query transactionsList($limit: Int!, $offset: Int!, $filter: TransactionFilter) {
  transactions(
    first: $limit,
    offset: $offset,
    orderBy: BLOCK_ID_DESC
    filter: $filter
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

### `transactionsSummary`
- **File:** `app/(lists)/txs/operations.ts`
- **Used for:** Summary cards above the table.

```graphql
query transactionsSummary($startDate: Datetime!, $endDate: Datetime!) {
  blocks(orderBy: ID_DESC, first: 1) {
    nodes {
      totalTxs
    }
  }
  validTxs: transactions(
    filter: {
      code: { equalTo: 0 }
      block: { timestamp: { greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate} }
    }
  ) {
    totalCount
  }
  failedTxs: transactions(
    filter: {
      code: { notEqualTo: 0 }
      block: { timestamp: { greaterThanOrEqualTo: $startDate, lessThanOrEqualTo: $endDate} }
    }
  ) {
    totalCount
  }
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

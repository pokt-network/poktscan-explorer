# List: Accounts

[← Index](README.md)

**Route:** `/accounts`
**Source:** `app/(lists)/accounts/page.tsx`

## Purpose
Top-balance accounts in `upokt`, with summary stats by activity window.

## GraphQL Queries

### `accountList`
- **File:** `app/(lists)/accounts/operations.ts`
- **Used for:** Paginated balances table ordered by amount descending.

```graphql
query accountList($limit: Int!, $offset: Int!) {
  balances (
    first: $limit,
    offset: $offset,
    orderBy: AMOUNT_DESC
    filter: {denom: {equalTo: "upokt"}}
  ) {
    totalCount
    nodes {
      amount
      denom
      accountId
      lastUpdatedBlock {
        height: id
        timestamp
      }
    }
  }
}
```

### `accountSummary`
- **File:** `app/(lists)/accounts/operations.ts`
- **Used for:** Four summary cards (total accounts with balance; active today, last month, last 90 days).

```graphql
query accountSummary($todayDate: Datetime!, $monthDate: Datetime!, $last90Date: Datetime!) {
  accountsWithBalance: balances(filter: {amount: {greaterThan: "0"}}) {
    totalCount
  }
  todayAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $todayDate}}, denom: {equalTo: "upokt"}}) {
    totalCount
  }
  monthAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $monthDate}}, denom: {equalTo: "upokt"}}) {
    totalCount
  }
  last90DaysAccounts: balances(filter: {lastUpdatedBlock: {timestamp: {greaterThanOrEqualTo: $last90Date}}, denom: {equalTo: "upokt"}}) {
    totalCount
  }
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

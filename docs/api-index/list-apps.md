# List: Applications

[← Index](README.md)

**Route:** `/apps`
**Source:** `app/(lists)/apps/page.tsx`

## Purpose
Paginated, filterable list of Applications with summary cards (staked and unstaking apps and tokens).

## GraphQL Queries

### `applicationsSummary`
- **File:** `app/(lists)/apps/operations.ts`
- **Used for:** Four summary cards at the top of the list.

```graphql
query applicationsSummary {
  stakedApps: applications(filter: {stakeStatus: {equalTo: Staked}}) {
    totalCount
    aggregates {
      sum {
        stakeAmount
      }
    }
  }
  unstakingApps: applications(filter: {stakeStatus: {equalTo: Unstaking}}) {
    totalCount
    aggregates {
      sum {
        stakeAmount
      }
    }
  }
}
```

## Shared queries used
- `applicationList`, `paramsForAppsFilters` via `AppsTable` — see [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

# List: Suppliers

[← Index](README.md)

**Route:** `/suppliers`
**Source:** `app/(lists)/suppliers/page.tsx`

## Purpose
Paginated, filterable Suppliers list with summary cards (staked and unstaking suppliers and tokens).

## GraphQL Queries

### `supplierSummary`
- **File:** `app/(lists)/suppliers/operations.ts`
- **Used for:** Four summary cards at the top of the list.

```graphql
query supplierSummary {
  stakedSuppliers: suppliers(filter: {stakeStatus: {equalTo: Staked}}) {
    totalCount
    aggregates {
      sum {
        stakeAmount
      }
    }
  }
  unstakingSuppliers: suppliers(filter: {stakeStatus: {equalTo: Unstaking}}) {
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
- `supplierList`, `paramsForSupplierFilters` via `SuppliersTable` — see [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

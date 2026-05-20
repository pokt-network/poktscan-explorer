# List: Validators

[← Index](README.md)

**Route:** `/validators`
**Source:** `app/(lists)/validators/page.tsx`

## Purpose
Paginated list of consensus validators with stake, commission, and self-delegation.

## GraphQL Queries

### `validatorsList`
- **File:** `app/(lists)/validators/page.tsx` (defined inline; no `operations.ts`)
- **Used for:** Validators table.

```graphql
query validatorsList($limit: Int!, $offset: Int!) {
  validators(first: $limit, offset: $offset) {
    totalCount
    nodes {
      id
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
      }
    }
  }
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

# Detail: Supplier

[← Index](README.md)

**Route:** `/supplier/[id]`
**Source:** `app/(details)/supplier/[id]/page.tsx` -> `PageClient.tsx`

## Purpose
Supplier detail with owner and operator balances, stake info, a Services tab listing each service config (rev share, endpoints, activation block), plus transactions, transfers, and raw tabs.

## GraphQL Queries

### `supplierById`
- **File:** `app/(details)/supplier/[id]/operations.ts`
- **Used for:** Detail card and initial Services list.

```graphql
query supplierById($id: String!) {
  supplier(id: $id) {
    id
    owner {
      id
      balances {
        nodes {
          amount
          denom
        }
      }
    }
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
    unstakingEndBlock {
      height: id
    }
    unstakingBeginBlock {
      height: id
    }
    unstakingEndHeight
    supplierServices: serviceConfigs {
      nodes {
        activatedAt {
          id
        }
        revShare
        endpoints
        service {
          id
          name
        }
      }
    }
  }
}
```

### `servicesOfSupplier`
- **File:** `app/(details)/supplier/[id]/operations.ts`
- **Used for:** Cursor-paginated lookup of additional service configs for the Services tab when there are many.

```graphql
query servicesOfSupplier($address: String!, $cursor: Cursor) {
  supplierServiceConfigs(
    filter: {
      supplierId: {
        equalTo: $address
      }
    }
    after: $cursor
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      serviceId
      revShare
      endpoints
      activatedAtId
    }
  }
}
```

## Non-GraphQL sources
- `getSupplier.ts` falls back to the Cosmos LCD when the indexer is behind.

## Shared queries used
- `transactionsByAddress`, `transfersList` for the Transactions and Transfers tabs — see [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

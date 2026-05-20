# Params

[← Index](README.md)

**Route:** `/params`
**Source:** `app/params/page.tsx` -> `app/params/ParamList.tsx`

## Purpose
Lists the latest value of every on-chain module parameter, grouped by namespace.

## GraphQL Queries

### `params`
- **File:** `app/params/operations.ts`
- **Used for:** Source data for the `ParamList` table. The query uses `distinct: [NAMESPACE, KEY]` so each param is returned at its latest value.

```graphql
query params {
  params(
    orderBy: [BLOCK_ID_DESC]
    distinct: [NAMESPACE, KEY]
    first: 1000
  ) {
    nodes {
      namespace
      id
      key
      value
      block {
        height: id
      }
    }
  }
}
```

## Shared queries used
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

# Detail: Service

[← Index](README.md)

**Route:** `/service/[id]`
**Source:** `app/(details)/service/[id]/page.tsx` -> `Tabs.tsx`

## Purpose
Service detail with a header card plus tabs that list the Suppliers serving the service, the Apps using it, the Gateways delegated to those apps, and a raw view.

## GraphQL Queries

### `serviceById`
- **File:** `app/(details)/service/[id]/operations.ts`
- **Used for:** Detail header — compute units per relay, owner, app and supplier counts, latest relay mining difficulty.

```graphql
query serviceById($id: String!) {
  service(id: $id) {
    id
    name
    computeUnitsPerRelay
    ownerId
    apps: applicationServices {
      totalCount
    }
    suppliers: supplierServiceConfigs {
      totalCount
    }
    relayMiningDifficultyUpdatedEvents(
      orderBy: BLOCK_ID_DESC
      first: 1
    ) {
      nodes {
        newNumRelaysEma
      }
    }
  }
}
```

## Non-GraphQL sources
- `getService.ts` falls back to the Cosmos LCD when the indexer is behind.

## Shared queries used
- Suppliers tab: `supplierList` and `paramsForSupplierFilters` via `SuppliersTable`.
- Apps tab: `applicationList` and `paramsForAppsFilters` via `AppsTable`.
- Gateways tab: `gatewayList` via `GatewaysTable`.
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

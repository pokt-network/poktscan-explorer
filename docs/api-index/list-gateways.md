# List: Gateways

[← Index](README.md)

**Route:** `/gateways`
**Source:** `app/(lists)/gateways/page.tsx`

## Purpose
Paginated, filterable Gateways list. Pure consumer of the shared `GatewaysTable`.

## GraphQL Queries

The page has no local operations file. All data is fetched by the embedded `GatewaysTable`.

## Shared queries used
- `gatewayList` via `GatewaysTable` — also returns a `stakedGateways` aggregate used for header stats. See [`_shared.md`](./_shared.md).
- `status`, `metadata` — see [`_shared.md`](./_shared.md).

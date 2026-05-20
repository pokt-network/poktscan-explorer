# API Index

Per-page documentation of the GraphQL queries the current Pocket Network Explorer consumes. The goal is to give a team rebuilding `explorer.pocket.network` a one-stop view of the data each page needs, so they can plan an equivalent backend or reuse the same indexer.

## How to use this folder

- Start with the page you want to rebuild (see groups below).
- Each per-page file lists the queries that page issues directly, the source file they live in, what the UI uses them for, and the most useful fields.
- Queries shared across many pages (status, search, transactions tabs, table components) live in [`_shared.md`](./_shared.md). Per-page docs reference them by name to avoid duplication.
- Pages that also call the Cosmos LCD or Tendermint RPC (mostly as a fallback when the indexer lags) note this under `Non-GraphQL sources`.

Schema source: `app/config/gql` (codegen) targeting a SubQuery-style indexer.

## Cross-cutting

- [`_shared.md`](./_shared.md) — queries from shared components, contexts, and the global search bar.
- [`external-pokt-money.md`](./external-pokt-money.md) — plain-text supply endpoints exposed by the separate `pokt-money` app (not part of this explorer).

## Home and top-level

- [`home.md`](./home.md) — `/` landing page.
- [`params.md`](./params.md) — `/params` module parameters.
- [`migration.md`](./migration.md) — `/migration` Morse claimable accounts.

## Tools

- [`tools-operator.md`](./tools-operator.md) — `/tools/operator` operator dashboard.
- [`tools-staking.md`](./tools-staking.md) — `/tools/staking` per-owner suppliers view.

## Dashboards

- [`dashboards-services.md`](./dashboards-services.md) — `/dashboards/services` service analytics.
- [`dashboards-node-running.md`](./dashboards-node-running.md) — `/dashboards/node-running` claim/proof time-series.

## Lists

- [`list-accounts.md`](./list-accounts.md) — `/accounts`
- [`list-apps.md`](./list-apps.md) — `/apps`
- [`list-blocks.md`](./list-blocks.md) — `/blocks`
- [`list-gateways.md`](./list-gateways.md) — `/gateways`
- [`list-services.md`](./list-services.md) — `/services`
- [`list-suppliers.md`](./list-suppliers.md) — `/suppliers`
- [`list-txs.md`](./list-txs.md) — `/txs`
- [`list-validators.md`](./list-validators.md) — `/validators`

## Detail

- [`detail-account.md`](./detail-account.md) — `/account/[id]`
- [`detail-app.md`](./detail-app.md) — `/app/[id]`
- [`detail-block.md`](./detail-block.md) — `/block/[id]`
- [`detail-gateway.md`](./detail-gateway.md) — `/gateway/[id]`
- [`detail-service.md`](./detail-service.md) — `/service/[id]`
- [`detail-supplier.md`](./detail-supplier.md) — `/supplier/[id]`
- [`detail-tx.md`](./detail-tx.md) — `/tx/[id]`
- [`detail-validator.md`](./detail-validator.md) — `/validator/[id]`

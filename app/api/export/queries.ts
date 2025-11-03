/**
 * SQL query builders for CSV export
 * Each query is derived from the GraphQL documents in operations.ts files
 * Uses DATABASE_SCHEMA environment variable for table references
 */

import { StakeStatus } from "@/app/config/gql/graphql";

export type SupportedEntity =
  | 'accounts'
  | 'apps'
  | 'blocks'
  | 'gateways'
  | 'migration'
  | 'services'
  | 'suppliers'
  | 'transfers'
  | 'txs'
  | 'validators';

export const SUPPORTED_ENTITIES: readonly SupportedEntity[] = [
  'accounts',
  'apps',
  'blocks',
  'gateways',
  'migration',
  'services',
  'suppliers',
  'transfers',
  'txs',
  'validators',
] as const;

/**
 * Get the database schema from environment variable
 * Defaults to 'app_public' if not set
 */
function getSchema(): string {
  return process.env.DB_SCHEMA || 'app_public';
}

/**
 * Column definitions for CSV export
 * Derived from the columns constant in each page.tsx file
 */
export const ENTITY_COLUMNS: Record<SupportedEntity, string[]> = {
  accounts: ['Address', 'Updated Height', 'Updated Time', 'Balance (POKT)'],
  apps: ['Address', 'Status', 'Stake Amount (POKT)', 'Balance (POKT)', 'Services Count', 'Gateways Count'],
  blocks: [
    'Height',
    'Timestamp',
    'Proposer',
    'Took (seconds)',
    'Total Supply',
    'Total Transactions',
    'Staked Suppliers',
    'Staked Apps',
    'Staked Gateways',
    'Total Relays',
    'Size (bytes)',
  ],
  gateways: [
    'Address',
    'Status',
    'Stake Amount (POKT)',
    'Balance (POKT)',
    'Applications Count',
  ],
  migration: [
    'Morse Address',
    'Liquid Balance (POKT)',
    'Supplier Stake (POKT)',
    'App Stake (POKT)',
    'Destination Address',
    'Claimed At Height',
    'Transaction Hash',
  ],
  services: [
    'ID',
    'Name',
    'Compute Units Per Relay',
    'Relay Mining Difficulty',
    'Applications Count',
    'Suppliers Count',
  ],
  suppliers: [
    'Address',
    'Status',
    'Stake Type',
    'Stake Amount (POKT)',
    'Operator Balance (POKT)',
    'Owner Address',
    'Owner Balance (POKT)',
    'Services Count',
  ],
  transfers: [
    'Transaction Hash',
    'Block Height',
    'Timestamp',
    'From',
    'Flow',
    'To',
    'Amount (POKT)',
    'Fee (POKT)',
  ],
  txs: [
    'Transaction Hash',
    'Block Height',
    'Timestamp',
    'Signer',
    'Result Code',
    'Amount Sent (POKT)',
    'Fee (POKT)',
    'Gas Used',
    'Gas Wanted',
    'Messages Count',
  ],
  validators: [
    'Address',
    'Signer',
    'Moniker',
    'Status',
    'Stake Amount (POKT)',
    'Min Self Delegation',
    'Commission Rate',
    'Commission Max Rate',
  ],
};

const LIMIT_TO_EXPORT = Number.isSafeInteger(parseInt(process.env.NEXT_PUBLIC_LIMIT_TO_EXPORT || ''))
  ? parseInt(process.env.NEXT_PUBLIC_LIMIT_TO_EXPORT!)
  : 10000;

/**
 * Filter options for entity queries
 */
export interface EntityQueryOptions {
  filter?: string;
  address?: string;
  height?: string;
  // Entity-specific filters
  gateway?: string;
  service?: string;
  app?: string;
  owner?: string;
  owners?: string[];
  delegators?: string[];
}


/**
 * Build WHERE clause for application-specific filters
 */
function getAppFilter(
  filter: string | undefined,
  schema: string,
  gateway?: string,
  service?: string
): string {
  const conditions: string[] = [];

  // Handle stake status filters
  if (!filter) {
    conditions.push(`a.stake_status = '${StakeStatus.Staked}'`);
  } else {
    switch (filter) {
      case 'all':
        conditions.push(`1=1`);
        break;
      case 'staked':
        conditions.push(`a.stake_status = '${StakeStatus.Staked}'`);
        break;
      case 'unstaking':
        conditions.push(`a.stake_status = '${StakeStatus.Unstaking}'`);
        break;
      case 'unstaked':
        conditions.push(`a.stake_status = '${StakeStatus.Unstaked}'`);
        break;
      case 'low_balance':
        conditions.push(`a.stake_status = '${StakeStatus.Staked}' AND COALESCE(b.amount, '0')::numeric <= ${2 * 1e6}`);
        break;
      default:
        conditions.push(`a.stake_status = '${StakeStatus.Staked}'`);
        break;
    }
  }

  // Gateway filter
  if (gateway) {
    conditions.push(`EXISTS (
      SELECT 1 FROM ${schema}.application_gateways ag
      WHERE ag.application_id = a.id
        AND ag.gateway_id = '${gateway}'
        AND UPPER(ag._block_range) IS NULL
    )`);
  }

  // Service filter
  if (service) {
    conditions.push(`EXISTS (
      SELECT 1 FROM ${schema}.application_services asv
      WHERE asv.application_id = a.id
        AND asv.service_id = '${service}'
        AND UPPER(asv._block_range) IS NULL
    )`);
  }

  return conditions.join(' AND ');
}

/**
 * Build WHERE clause for gateway-specific filters
 */
function getGatewayFilter(
  filter: string | undefined,
  schema: string,
  app?: string,
  service?: string
): string {
  const conditions: string[] = [];

  // Handle stake status filters
  if (!filter) {
    conditions.push(`g.stake_status = '${StakeStatus.Staked}'`);
  } else {
    switch (filter) {
      case 'all':
        conditions.push(`1=1`);
        break;
      case 'staked':
        conditions.push(`g.stake_status = '${StakeStatus.Staked}'`);
        break;
      case 'unstaking':
        conditions.push(`g.stake_status = '${StakeStatus.Unstaking}'`);
        break;
      case 'unstaked':
        conditions.push(`g.stake_status = '${StakeStatus.Unstaked}'`);
        break;
      case 'low_balance':
        conditions.push(`g.stake_status = '${StakeStatus.Staked}' AND COALESCE(b.amount, '0')::numeric <= ${2 * 1e6}`);
        break;
      default:
        conditions.push(`g.stake_status = '${StakeStatus.Staked}'`);
        break;
    }
  }

  // Application filter
  if (app) {
    conditions.push(`EXISTS (
      SELECT 1 FROM ${schema}.application_gateways ag
      WHERE ag.gateway_id = g.id
        AND ag.application_id = '${app}'
        AND UPPER(ag._block_range) IS NULL
    )`);
  }

  // Service filter (gateway serves a service through its applications)
  if (service) {
    conditions.push(`EXISTS (
      SELECT 1 FROM ${schema}.application_gateways ag
      INNER JOIN ${schema}.application_services asv
        ON asv.application_id = ag.application_id
        AND UPPER(asv._block_range) IS NULL
      WHERE ag.gateway_id = g.id
        AND asv.service_id = '${service}'
        AND UPPER(ag._block_range) IS NULL
    )`);
  }

  return conditions.join(' AND ');
}

/**
 * Build WHERE clause for supplier-specific filters
 */
function getSupplierFilter(
  filter: string | undefined,
  schema: string,
  service?: string,
  owner?: string,
  owners?: string[],
  delegators?: string[]
): string {
  const conditions: string[] = [];

  // Default: show only staked
  switch (filter) {
    case undefined:
    case 'staked':
      conditions.push(`s.stake_status = '${StakeStatus.Staked}'`);
      break;
    case 'all':
      conditions.push(`1=1`);
      break;
    case 'unstaking':
      conditions.push(`s.stake_status = '${StakeStatus.Unstaking}'`);
      break;
    case 'unstaked':
      conditions.push(`s.stake_status = '${StakeStatus.Unstaked}'`);
      break;
    case 'low_balance':
      conditions.push(`
        s.stake_status = '${StakeStatus.Staked}'
        AND COALESCE(b_operator.amount, 0)::numeric <= ${1e6 * 2}
      `);
      break;
    case 'low_stake':
      conditions.push(`
        s.stake_status = '${StakeStatus.Staked}'
        AND s.stake_amount::numeric > (
          SELECT (p_min.value::jsonb->>'amount')::numeric
          FROM ${schema}.params p_min
          WHERE p_min.namespace = 'supplier'
            AND p_min.key = 'min_stake'
            AND UPPER(p_min._block_range) IS NULL
          ORDER BY p_min.block_id DESC
          LIMIT 1
        )
        AND s.stake_amount::numeric <= (
          SELECT (p_min.value::jsonb->>'amount')::numeric +
                 5 * (p_penalty.value::jsonb->>'amount')::numeric
          FROM ${schema}.params p_min, ${schema}.params p_penalty
          WHERE p_min.namespace = 'supplier' AND p_min.key = 'min_stake'
            AND p_penalty.namespace = 'proof' AND p_penalty.key = 'proof_missing_penalty'
            AND UPPER(p_min._block_range) IS NULL
          ORDER BY p_min.block_id DESC, p_penalty.block_id DESC
          LIMIT 1
        )
      `);
      break;
    case 'below_min_stake':
      conditions.push(`
        s.stake_status = '${StakeStatus.Staked}'
        AND s.stake_amount::numeric < (
          SELECT (value::jsonb->>'amount')::numeric
          FROM ${schema}.params
          WHERE namespace = 'supplier'
            AND key = 'min_stake'
            AND UPPER(_block_range) IS NULL
          ORDER BY block_id DESC
          LIMIT 1
        )
      `);
      break;
    default:
      conditions.push(`s.stake_status = '${StakeStatus.Staked}'`);
      break;
  }

  if (service) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM ${schema}.supplier_service_configs ssc
        WHERE ssc.supplier_id = s.id
          AND ssc.service_id = '${service}'
          AND UPPER(ssc._block_range) IS NULL
      )
    `);
  }

  if (owner) conditions.push(`s.owner_id = '${owner}'`);

  if (owners?.length)
    conditions.push(`s.owner_id IN (${owners.map(o => `'${o}'`).join(', ')})`);

  if (delegators?.length) {
    const delegatorChecks = delegators
      .map(d => `ssc.rev_share::jsonb @> '[{"address": "${d}"}]'::jsonb`)
      .join(' OR ');
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM ${schema}.supplier_service_configs ssc
        WHERE ssc.supplier_id = s.id
          AND UPPER(ssc._block_range) IS NULL
          AND (${delegatorChecks})
      )
    `);
  }

  return conditions.join(' AND ');
}

/**
 * Build WHERE clause for transaction filters
 */
function getTransactionFilter(
  filter: string | undefined,
  address: string | undefined,
  height: string | undefined
): string {
  const conditions: string[] = [];

  // Message type filter
  if (filter && filter !== 'all') {
    const messageTypesByFilter: Record<string, string[]> = {
      send: ['/cosmos.bank.v1beta1.MsgSend', '/cosmos.bank.v1beta1.MsgMultiSend'],
      claim: ['/pocket.proof.MsgCreateClaim'],
      proof: ['/pocket.proof.MsgSubmitProof'],
      governance: ['/cosmos.authz.v1beta1.MsgExec'],
      staking: [
        '/pocket.supplier.MsgStakeSupplier',
        '/pocket.application.MsgStakeApplication',
        '/pocket.gateway.MsgStakeGateway',
        '/pocket.supplier.MsgUnstakeSupplier',
        '/pocket.application.MsgUnstakeApplication',
        '/pocket.gateway.MsgUnstakeGateway',
      ],
    };

    const messageTypes = messageTypesByFilter[filter];
    if (messageTypes && messageTypes.length > 0) {
      const messageConditions = messageTypes
        .map(
          (msgType) =>
            `t.amount_of_messages::jsonb @> '[{"type": "${msgType}"}]'::jsonb`
        )
        .join(' OR ');
      conditions.push(`(${messageConditions})`);
    }
  }

  // Address filter
  if (address) {
    conditions.push(`t.signer_address = '${address}'`);
  }

  // Height filter
  if (height) {
    conditions.push(`t.block_id = ${parseInt(height)}`);
  }

  return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
}

/**
 * Build WHERE clause for transfer filters
 */
function getTransferFilter(address: string | undefined): string {
  if (!address) {
    return '1=1';
  }

  // Filter transfers where address is either sender or recipient
  // Note: senderId and recipientId are incorrectly mapped in the indexer (swapped)
  return `(nt.recipient_id = '${address}' OR nt.sender_id = '${address}')`;
}

/**
 * Build WHERE clause for migration filters
 * Supports both Shannon (pokt) and Morse addresses
 */
function getMigrationFilter(address: string | undefined): string {
  if (!address) {
    return '1=1';
  }

  // Check if it's a Shannon address (starts with 'pokt')
  if (address.startsWith('pokt')) {
    return `LOWER(mca.shannon_dest_address) = LOWER('${address}')`;
  } else {
    // Morse address - check both id and morse_output_address
    return `(LOWER(mca.id) = LOWER('${address}') OR LOWER(mca.morse_output_address) = LOWER('${address}'))`;
  }
}

/**
 * Get COPY TO STDOUT query for a specific entity
 * Uses PostgreSQL COPY command for optimal performance
 * Tables are referenced using ${DATABASE_SCHEMA}.table_name format
 */
export function getEntityQuery(
  entity: SupportedEntity,
  options: EntityQueryOptions = {}
): string {
  const schema = getSchema();
  const { filter, address, height, gateway, service, app, owner, owners, delegators } = options;

  const queries: Record<SupportedEntity, string> = {
    accounts: `
      COPY (
        SELECT
          b.account_id,
          b.last_updated_block_id,
          bl.timestamp,
          (CASE WHEN b.amount = 0 THEN 0 ELSE (b.amount / 1000000) END) AS balance
        FROM ${schema}.balances b
        LEFT JOIN ${schema}.blocks bl ON bl.id = b.last_updated_block_id
        WHERE b.denom = 'upokt' AND UPPER(b._block_range) IS NULL
        ORDER BY b.amount DESC
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    apps: `
      COPY (
        SELECT
          a.id,
          a.stake_status,
          (CASE WHEN a.stake_amount = 0 THEN 0 ELSE (a.stake_amount / 1000000) END) AS stake_amount_pokt,
          (CASE WHEN b.amount = 0 THEN 0 ELSE (b.amount / 1000000) END) AS balance_pokt,
          COALESCE(
            (SELECT COUNT(*) FROM ${schema}.application_services WHERE application_id = a.id AND UPPER(_block_range) IS NULL),
            0
          ) AS services_count,
          COALESCE(
            (SELECT COUNT(*) FROM ${schema}.application_gateways WHERE application_id = a.id AND UPPER(_block_range) IS NULL),
            0
          ) AS gateways_count
        FROM ${schema}.applications a
        LEFT JOIN ${schema}.balances b
          ON b.account_id = a.account_id
          AND b.denom = 'upokt'
          AND UPPER(b._block_range) IS NULL
        WHERE UPPER(a._block_range) IS NULL
          AND ${getAppFilter(filter, schema, gateway, service)}
        ORDER BY a.id
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    blocks: `
      COPY (
        SELECT
          b.id,
          b.timestamp,
          b.proposer_address,
          b.time_to_block,
          '-',
          b.total_txs,
          b.staked_suppliers,
          b.staked_apps,
          b.staked_gateways,
          b.total_relays,
          b.size
        FROM ${schema}.blocks b
        ORDER BY b.id DESC
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    gateways: `
      COPY (
        SELECT
          g.id,
          g.stake_status,
          (CASE WHEN g.stake_amount = 0 THEN 0 ELSE (g.stake_amount / 1000000) END) AS stake_amount_pokt,
          (CASE WHEN b.amount = 0 THEN 0 ELSE (b.amount / 1000000) END) AS balance_pokt,
          COALESCE(
            (SELECT COUNT(*) FROM ${schema}.application_gateways WHERE gateway_id = g.id AND UPPER(_block_range) IS NULL),
            0
          ) AS applications_count
        FROM ${schema}.gateways g
        LEFT JOIN ${schema}.balances b
          ON b.account_id = g.account_id
          AND b.denom = 'upokt'
          AND UPPER(b._block_range) IS NULL
        WHERE UPPER(g._block_range) IS NULL
          AND ${getGatewayFilter(filter, schema, app, service)}
        ORDER BY g.id
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    services: `
      COPY (
        SELECT
          s.id,
          s.name,
          s.compute_units_per_relay,
          e.new_num_relays_ema,
          COALESCE(app.count_apps, 0) AS app_count,
          COALESCE(conf.count_configs, 0) AS config_count
        FROM ${schema}.services s
        LEFT JOIN LATERAL (
          SELECT e.new_num_relays_ema
          FROM ${schema}.event_relay_mining_difficulty_updateds e
          WHERE e.service_id = s.id
          ORDER BY e.block_id DESC
          LIMIT 1
        ) e ON TRUE
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS count_apps
          FROM ${schema}.application_services a
          WHERE a.service_id = s.id AND UPPER(a._block_range) IS NULL
        ) app ON TRUE
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS count_configs
          FROM ${schema}.supplier_service_configs c
          WHERE c.service_id = s.id AND UPPER(c._block_range) IS NULL
        ) conf ON TRUE
        ORDER BY s.id
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,
    suppliers: `
      COPY (
        SELECT
          s.id,
          s.stake_status,
          CASE
            WHEN s.stake_status = '${StakeStatus.Staked}' AND s.operator_id = s.owner_id THEN 'Custodian'
            WHEN s.stake_status = '${StakeStatus.Staked}' THEN 'Non-Custodian'
            ELSE '-'
          END AS stake_type,
          (s.stake_amount / 1_000_000.0) AS stake_amount_pokt,
          COALESCE(b_operator.amount, 0) / 1_000_000.0 AS operator_balance_pokt,
          CASE
            WHEN s.operator_id = s.owner_id THEN '-' ELSE s.owner_id
          END AS owner_address,
          CASE
            WHEN s.operator_id = s.owner_id THEN '-'
            ELSE (COALESCE(b_owner.amount, 0) / 1_000_000.0)::text
          END AS owner_balance_pokt,
          COALESCE(cfg.services_count, 0) AS services_count
        FROM ${schema}.suppliers s
        LEFT JOIN ${schema}.balances b_operator
          ON b_operator.account_id = s.operator_id
          AND b_operator.denom = 'upokt'
          AND UPPER(b_operator._block_range) IS NULL
        LEFT JOIN ${schema}.balances b_owner
          ON b_owner.account_id = s.owner_id
          AND b_owner.denom = 'upokt'
          AND UPPER(b_owner._block_range) IS NULL
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS services_count
          FROM ${schema}.supplier_service_configs ssc
          WHERE ssc.supplier_id = s.id
            AND UPPER(ssc._block_range) IS NULL
        ) cfg ON TRUE
        WHERE
          UPPER(s._block_range) IS NULL
          AND ${getSupplierFilter(filter, schema, service, owner, owners, delegators)}
        ORDER BY s.stake_status ASC, s.stake_amount DESC
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    transfers: `
      COPY (
        SELECT
          t.id,
          nt.block_id,
          b.timestamp,
          nt.recipient_id,
          CASE
            WHEN '${address || ''}' = '' THEN ''
            WHEN nt.recipient_id = '${address || ''}' THEN 'OUT'
            ELSE 'IN'
          END,
          nt.sender_id,
          (
            SELECT
              CASE
                WHEN COALESCE(SUM((elem->>'amount')::numeric), 0) = 0 THEN 0
                ELSE COALESCE(SUM((elem->>'amount')::numeric), 0) / 1000000
              END
            FROM jsonb_array_elements(nt.amounts) AS elem
            WHERE elem->>'denom' = 'upokt'
          ),
          (
            SELECT
              CASE
                WHEN COALESCE(SUM((elem->>'amount')::numeric), 0) = 0 THEN 0
                ELSE COALESCE(SUM((elem->>'amount')::numeric), 0) / 1000000
              END
            FROM jsonb_array_elements(t.fees) AS elem
            WHERE elem->>'denom' = 'upokt'
          )
        FROM ${schema}.native_transfers nt
        LEFT JOIN ${schema}.transactions t ON t.id = nt.transaction_id
        LEFT JOIN ${schema}.blocks b ON b.id = nt.block_id
        WHERE ${getTransferFilter(address)}
        ORDER BY nt.block_id DESC
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    migration: `
      COPY (
        SELECT
          mca.id,
          (CASE WHEN mca.unstaked_balance_amount = 0 THEN 0 ELSE (mca.unstaked_balance_amount / 1000000) END),
          (CASE WHEN mca.supplier_stake_amount = 0 THEN 0 ELSE (mca.supplier_stake_amount / 1000000) END),
          (CASE WHEN mca.application_stake_amount = 0 THEN 0 ELSE (mca.application_stake_amount / 1000000) END),
          COALESCE(mca.shannon_dest_address, ''),
          COALESCE(mca.claimed_at_id, 0),
          COALESCE(mca.transaction_id, '')
        FROM ${schema}.morse_claimable_accounts mca
        WHERE ${getMigrationFilter(address)}
        ORDER BY mca.claimed DESC, mca.claimed_at_id DESC
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    txs: `
      COPY (
        SELECT
          t.id,
          t.block_id,
          b.timestamp,
          t.signer_address,
          t.code,
          (
            SELECT
              CASE
                WHEN COALESCE(SUM((elem->>'amount')::numeric), 0) = 0 THEN 0
                ELSE COALESCE(SUM((elem->>'amount')::numeric), 0) / 1000000
              END
            FROM jsonb_array_elements(t.amount_sent_by_denom) AS elem
            WHERE elem->>'denom' = 'upokt'
          ),
          (
            SELECT
              CASE
                WHEN COALESCE(SUM((elem->>'amount')::numeric), 0) = 0 THEN 0
                ELSE COALESCE(SUM((elem->>'amount')::numeric), 0) / 1000000
              END
            FROM jsonb_array_elements(t.fees) AS elem
            WHERE elem->>'denom' = 'upokt'
          ),
          t.gas_used,
          t.gas_wanted,
          (
            SELECT COALESCE(SUM((elem->>'amount')::integer), 0)
            FROM jsonb_array_elements(t.amount_of_messages) AS elem
          )
        FROM ${schema}.transactions t
        LEFT JOIN ${schema}.blocks b ON b.id = t.block_id
        WHERE ${getTransactionFilter(filter, address, height)}
        ORDER BY t.block_id DESC
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,

    validators: `
      COPY (
        SELECT
          v.id,
          v.signer_id,
          v.description->>'moniker',
          v.stake_status,
          (CASE WHEN v.stake_amount = 0 THEN 0 ELSE (v.stake_amount / 1000000) END),
          v.min_self_delegation,
          CAST(v.commission->>'rate' AS NUMERIC),
          CAST(v.commission->>'maxRate' AS NUMERIC)
        FROM ${schema}.validators v
        WHERE UPPER(v._block_range) IS NULL
        ORDER BY v.id
        LIMIT ${LIMIT_TO_EXPORT}
      ) TO STDOUT WITH CSV
    `,
  };

  return queries[entity];
}

/**
 * Check if an entity is supported
 */
export function isSupportedEntity(entity: string): entity is SupportedEntity {
  return SUPPORTED_ENTITIES.includes(entity as SupportedEntity);
}

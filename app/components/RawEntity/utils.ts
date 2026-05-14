import type { EntityLinkProps } from '@/app/components/EntityLink'

export function getUrl(baseUrl: string, entity: EntityLinkProps['entity'], id: string) {
  // Defensive: a falsy baseUrl would produce URLs like "undefined/cosmos/..."
  // which the browser tries to DNS-resolve, often triggering Private Network
  // Access prompts and hitting random devices on the user's LAN.
  if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
    throw new Error('RPC base URL is missing or invalid — check RPC_BASE_URL env var on the server and that RpcUrlProvider wraps the tree')
  }
  switch(entity) {
    case 'tx':
      return `${baseUrl}/cosmos/tx/v1beta1/txs/${id}`
    case 'app':
      return `${baseUrl}/pokt-network/poktroll/application/application/${id}`
    case 'supplier':
      return `${baseUrl}/pokt-network/poktroll/supplier/supplier/${id}`
    case 'gateway':
      return `${baseUrl}/pokt-network/poktroll/gateway/gateway/${id}`
    case 'block':
      return `${baseUrl}/cosmos/base/tendermint/v1beta1/blocks/${id}`
    case 'account':
      return  `${baseUrl}/cosmos/bank/v1beta1/balances/${id}`
    case 'validator':
      return `${baseUrl}/cosmos/staking/v1beta1/validators/${id}`
    case 'service':
      return `${baseUrl}/pokt-network/poktroll/service/service/${id}`
    default:
      throw new Error(`Unknown entity: ${entity}`)
  }
}

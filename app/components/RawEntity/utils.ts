import type { EntityLinkProps } from '@/app/components/EntityLink'

export function getUrl(baseUrl: string, entity: EntityLinkProps['entity'], id: string) {
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

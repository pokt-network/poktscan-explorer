import { StakeStatus } from '@/app/config/gql/graphql'

export function getStakeLabel(status: StakeStatus) {
  switch (status) {
    case StakeStatus.Staked:
      return 'Staked'
    case StakeStatus.Unstaking:
      return 'Unstaking'
    case StakeStatus.Unstaked:
      return 'Unstaked'
    default:
      return 'Unknown'
  }
}

export function getStakeType(status: StakeStatus, operatorAddress: string, ownerAddress?: string): 'Custodian' | 'Non-Custodian' | '-' {
  if (status === StakeStatus.Staked) {
    if (operatorAddress === ownerAddress || !ownerAddress) {
      return 'Custodian'
    } else {
      return 'Non-Custodian'
    }
  }

  return '-'
}

export function getEndpointLabel(type: number) {
  switch (type) {
    case 1:
      return 'gRPC'
    case 2:
      return 'WebSocket'
    case 3:
      return 'JSON-RPC'
    case 4:
      return 'REST'
    default:
      return 'Unknown'
  }
}

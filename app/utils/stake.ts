export function getStakeLabel(status: number) {
  switch (status) {
    case 0:
      return 'Staked'
    case 1:
      return 'Unstaking'
    case 2:
      return 'Unstaked'
    default:
      return 'Unknown'
  }
}

export function getStakeType(status: number, operatorAddress: string, ownerAddress: string): 'Custodian' | 'Non-Custodian' | '-' {
  if (status === 0) {
    if (operatorAddress === ownerAddress) {
      return 'Custodian'
    } else {
      return 'Non-Custodian'
    }
  }

  return '-'
}

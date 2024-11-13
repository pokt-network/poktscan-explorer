import { Balance } from '@/app/config/gql/graphql'

function convertUpoktToPokt(upokt: number | string): number {
  // todo: convert upokt to pokt using a library to divide precisely (not using floats)
  return Number(upokt) / 1e6
}

export function formatBalance(balance: {
  denom: string
  amount: string | number
}): string {
  if (balance.denom === 'upokt') {
    return `${Number(convertUpoktToPokt(balance.amount).toFixed(6)).toLocaleString()} POKT`
  }

  throw new Error(`Unsupported denom: ${balance.denom}`)
}

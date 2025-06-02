import Big from 'big.js'

export function calculatePercentageChange(current: Big, past: Big): number {
  return  past.gt(0) ? current.minus(past).div(past).mul(100).toNumber() : 100
}

export function calculatePercentage(value: Big, total: Big): number  {
  return  total.gt(0) ?  value.div(total).mul(100).toNumber() : 0
}

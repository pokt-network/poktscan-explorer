import Big from 'big.js'
import { differenceInMinutes, differenceInSeconds } from 'date-fns'

export function calculatePercentageChange(current: Big, past: Big): number {
  return  past.gt(0) ? current.minus(past).div(past).mul(100).toNumber() : 100
}

export function calculatePercentage(value: Big, total: Big): number  {
  return  total.gt(0) ?  value.div(total).mul(100).toNumber() : 0
}

interface GetProjectionProps {
  startOfDay: Date | string;
  currentDate: Date | string;
  unit: 'hours' | 'days';
  currentValue: string | number;
  previousValue: string | number;
}

export function getProjection({
 startOfDay,
 currentDate,
 unit,
 currentValue,
 previousValue,
}: GetProjectionProps) {
  let delta: Big

  if (unit === 'hours') {
    delta = new Big(differenceInSeconds(currentDate, startOfDay)).div(60).div(60)
  } else {
    delta = new Big(differenceInMinutes(currentDate, startOfDay)).div(60).div(24)
  }

  return new Big(previousValue).mul(new Big(1).minus(delta)).plus(currentValue)
}

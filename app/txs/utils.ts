import { LabelByIndex } from '@/app/components/FourCards/utils'
import { addHoursToUtc, getDateFromIsoString } from '@/app/Charts/utils'

export function getSummaryVariables(date: string) {
  const currentDate = getDateFromIsoString(date)
  const startDate = addHoursToUtc(currentDate, -24)

  return {
    startDate: startDate.toISOString(),
    endDate: currentDate.toISOString()
  }
}

export const transactionsSummaryLabels: LabelByIndex = {
  1: "Transactions (24H)",
  2: "Failed Transactions (24H)",
  3: "Total Transactions (24H)",
  4: "Transactions (Last Block)",
}

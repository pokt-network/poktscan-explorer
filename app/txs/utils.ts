import { LabelByIndex } from '@/app/components/FourCards/utils'

export function getSummaryVariables(date: string) {
  const currentDate = new Date(date)
  const startDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))

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

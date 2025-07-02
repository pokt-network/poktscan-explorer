import { addDaysToUtc, getDateFromIsoString, getUtcStartOfDay } from '@/app/Charts/utils'

export function getSummaryVariables(date: string) {
  const currentDate = getDateFromIsoString(date)

  const todayDate = getUtcStartOfDay(currentDate)
  const last30dDate = addDaysToUtc(todayDate, -30)
  const last90dDate = addDaysToUtc(todayDate, -90)

  return {
    todayDate: todayDate.toISOString(),
    monthDate: last30dDate.toISOString(),
    last90Date: last90dDate.toISOString()
  }
}

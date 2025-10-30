import { addHoursToUtc, getDateFromIsoString } from '@/app/Charts/utils'

export function getSummaryVariables(date: string) {
  const currentDate = getDateFromIsoString(date)
  const last24hDate = addHoursToUtc(currentDate, -24)

  return {
    startDate: last24hDate.toISOString(),
    endDate: currentDate.toISOString(),
  }
}

export function getSummaryVariables(date: string) {
  const currentDate = new Date(date)
  const last24hDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)

  return {
    startDate: last24hDate.toISOString(),
    endDate: currentDate.toISOString(),
  }
}

export function getSummaryVariables(date: string) {
  const currentDate = new Date(date)
  const startDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000))

  return {
    startDate: startDate.toISOString(),
    endDate: currentDate.toISOString()
  }
}

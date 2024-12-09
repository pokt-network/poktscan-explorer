export function getSummaryVariables(date: string) {
  const todayDate = new Date(date)
  todayDate.setHours(0, 0, 0, 0)

  const monthDate = new Date(date)
  monthDate.setMonth(monthDate.getMonth() - 1)

  const last90Date = new Date(date)
  last90Date.setMonth(last90Date.getMonth() - 3)

  return {
    todayDate: todayDate.toISOString(),
    monthDate: monthDate.toISOString(),
    last90Date: last90Date.toISOString()
  }
}

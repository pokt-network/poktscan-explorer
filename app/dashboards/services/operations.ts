import { graphql } from '@/app/config/gql'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import {
  addDaysToUtc,
  addHoursToUtc,
  getUtcEndOfDay,
  getUtcEndOfHour,
  getUtcStartOfDay,
  getUtcStartOfHour,
} from '@/app/Charts/utils'
import { Time } from '@/app/dashboards/services/constants'

export const servicesPerformanceDocument = graphql(`
  query servicesPerformance($endCurrent: Datetime!, $startCurrentAndEndPrevious: Datetime!, $startPrevious: Datetime!) {
    performance: servicesPerformanceBetweenTimes(
      endCurrent: $endCurrent,
      startCurrentAndEndPrevious: $startCurrentAndEndPrevious,
      startPrevious: $startPrevious
    )
    avgData: getAmountOfBlocksAndSuppliersByTimes(
      startDate: $startCurrentAndEndPrevious
      endDate: $endCurrent
    )
  }
`)

export const getServicesPerformanceVariables = (currentDate: Date | string, timeSelected: string): ExtractVariables<typeof servicesPerformanceDocument> => {
  let timeSelectedToUse = Time.Last30d

  if (timeSelected && Object.values(Time).includes(timeSelected as Time)) {
    timeSelectedToUse = timeSelected as Time
  }

  const endCurrent = new Date(currentDate)

  let startCurrentAndEndPrevious: Date, startPrevious: Date

  switch (timeSelectedToUse) {
    case Time.Last24h: {
      startCurrentAndEndPrevious = addHoursToUtc(endCurrent, -23)
      startPrevious = addHoursToUtc(startCurrentAndEndPrevious, -23)
      break
    }
    case Time.Last7d: {
      startCurrentAndEndPrevious = addDaysToUtc(endCurrent, -6)
      startPrevious = addDaysToUtc(startCurrentAndEndPrevious, -6)
      break
    }
    case Time.Last30d: {
      startCurrentAndEndPrevious = addDaysToUtc(endCurrent, -29)
      startPrevious = addDaysToUtc(startCurrentAndEndPrevious, -29)
      break
    }
    case Time.Last90d: {
      startCurrentAndEndPrevious = addDaysToUtc(endCurrent, -89)
      startPrevious = addDaysToUtc(startCurrentAndEndPrevious, -89)
      break
    }
  }

  return {
    endCurrent: endCurrent.toISOString(),
    startCurrentAndEndPrevious: startCurrentAndEndPrevious.toISOString(),
    startPrevious: startPrevious.toISOString()
  }
}

export const distributionDocument = graphql(`
  query distribution($startDate: Datetime!, $endDate: Datetime!) {
    relayByBlockAndServices(
      filter: {
        block: {
          timestamp: {
            greaterThanOrEqualTo: $startDate
            lessThan: $endDate
          }
        }
      }
    ){
      groupedAggregates(groupBy: SERVICE_ID) {
        keys
        sum {
          computedUnits
        }
      }
    }
  }
`)

export function getDistributionVariables(currentDate: Date | string, timeSelected: string): ExtractVariables<typeof distributionDocument> {
  let timeSelectedToUse = Time.Last30d

  if (timeSelected && Object.values(Time).includes(timeSelected as Time)) {
    timeSelectedToUse = timeSelected as Time
  }

  const endDate = new Date(currentDate)
  let startDate: Date

  switch (timeSelectedToUse) {
    case Time.Last24h: {
      startDate = addHoursToUtc(endDate, -23)
      break
    }
    case Time.Last7d: {
      startDate = addDaysToUtc(endDate, -6)
      break
    }
    case Time.Last30d: {
      startDate = addDaysToUtc(endDate, -29)
      break
    }
    case Time.Last90d: {
      startDate = addDaysToUtc(endDate, -89)
      break
    }
  }

  return {
    endDate: endDate.toISOString(),
    startDate: startDate.toISOString()
  }
}

export const productivityQuery = graphql(`
  query servicesProductivity($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    servicesProductivity: getRelaysByServicePerPointJson(
      startTimestamp: $startDate
      endTimestamp: $endDate
      truncInterval: $truncInterval
    )
    suppliersData: getSuppliersStakedAndBlocksByPointJson(
      startTimestamp: $startDate
      endTimestamp: $endDate
      truncInterval: $truncInterval
    )
  }
`)

export function getProductivityVariables(currentDate: Date | string, timeSelected: string): ExtractVariables<typeof productivityQuery> {
  let timeSelectedToUse = Time.Last30d

  if (timeSelected && Object.values(Time).includes(timeSelected as Time)) {
    timeSelectedToUse = timeSelected as Time
  }

  const endDate = timeSelectedToUse === Time.Last24h ? getUtcEndOfHour(currentDate) : getUtcEndOfDay(currentDate)
  let startDate: Date

  switch (timeSelectedToUse) {
    case Time.Last24h: {
      startDate = getUtcStartOfHour(addHoursToUtc(endDate, -23))
      break
    }
    case Time.Last7d: {
      startDate = getUtcStartOfDay(addDaysToUtc(endDate, -6))
      break
    }
    case Time.Last30d: {
      startDate = getUtcStartOfDay(addDaysToUtc(endDate, -29))
      break
    }
    case Time.Last90d: {
      startDate = getUtcStartOfDay(addDaysToUtc(endDate, -89))
      break
    }
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    truncInterval: timeSelectedToUse === Time.Last24h ? 'hour' : 'day'
  }
}

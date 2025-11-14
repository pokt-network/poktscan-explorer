import { gql } from '@apollo/client'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime, getStartMiddleAndEndDateBasedOnTime } from '@/app/utils/dates'

export const servicesPerformanceDocument = gql`
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
`

export const getServicesPerformanceVariables = (dateStr: string, timeSelected: string): ExtractVariables<typeof servicesPerformanceDocument> => {
  const {end, middle, start} = getStartMiddleAndEndDateBasedOnTime(
    dateStr,
    timeSelected,
  )

  return {
    endCurrent: end.toISOString(),
    startCurrentAndEndPrevious: middle.toISOString(),
    startPrevious: start.toISOString()
  }
}

export const distributionDocument = gql`
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
`

export function getDistributionVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof distributionDocument> {
  const {start, end} = getStartAndEndDateBasedOnTime(dateStr, timeSelected)

  return {
    endDate: end.toISOString(),
    startDate: start.toISOString()
  }
}

export const productivityQuery = gql`
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
`

export function getProductivityVariables(dateStr: string, timeSelected: string): ExtractVariables<typeof productivityQuery> {
  const {start, end, truncInterval} = getStartAndEndDateBasedOnTime(dateStr, timeSelected, true)

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}

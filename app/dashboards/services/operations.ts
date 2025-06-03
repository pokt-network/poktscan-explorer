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
  query servicesPerformance($startCurrent: Datetime!, $endCurrentAndStartPrevious: Datetime!, $endPrevious: Datetime!) {
    previousData: relayByBlockAndServices(
      first: 1,
      filter: {block: {timestamp: {greaterThanOrEqualTo: $endPrevious, lessThan: $endCurrentAndStartPrevious}}}
    ) {
      nodes {
        service {
          stakedSuppliersByBlockAndServices(
            filter: {block: {timestamp: {greaterThanOrEqualTo: $endPrevious, lessThan: $endCurrentAndStartPrevious}}}
          ) {
            totalCount
            aggregates {
              sum {
                amount
              }
            }
          }
        }
      }
      groupedAggregates(groupBy: SERVICE_ID) {
        keys
        sum {
          claimedUpokt
          computedUnits
          relays
        }
      }
    }
    currentData: relayByBlockAndServices(
      distinct: SERVICE_ID
      filter: {block: {timestamp: {greaterThanOrEqualTo:$endCurrentAndStartPrevious, lessThan: $startCurrent}}}
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        service {
          id
          name
          stakedSuppliers: supplierServiceConfigs(
            filter: {
              supplier: {
                stakeStatus: {
                  equalTo: Staked
                }
              }
            }
          ) {
            totalCount
          }
          stakedApps: applicationServices(
            filter: {
              application: {
                stakeStatus: {
                  equalTo: Staked
                }
              }
            }
          ) {
            totalCount
          }
          stakedSuppliersByBlockAndServices(
            filter: {block: {timestamp: {greaterThanOrEqualTo:$endCurrentAndStartPrevious, lessThan: $startCurrent}}}
          ) {
            totalCount
            aggregates {
              sum {
                amount
              }
            }
          }
        }
      }
      groupedAggregates(groupBy: SERVICE_ID) {
        keys
        sum {
          claimedUpokt
          computedUnits
          relays
        }
      }
    }
  }
`)

export const servicesDocument = graphql(`
  query servicesPerBlockPage($cursor: Cursor!, $startCurrent: Datetime!, $endCurrentAndStartPrevious: Datetime!) {
    currentData: relayByBlockAndServices(
      distinct: SERVICE_ID
      filter: {block: {timestamp: {greaterThanOrEqualTo:$endCurrentAndStartPrevious, lessThan: $startCurrent}}}
      after: $cursor
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        service {
          id
          name
          stakedSuppliers: supplierServiceConfigs(
            filter: {
              supplier: {
                stakeStatus: {
                  equalTo: Staked
                }
              }
            }
          ) {
            totalCount
          }
          stakedApps: applicationServices(
            filter: {
              application: {
                stakeStatus: {
                  equalTo: Staked
                }
              }
            }
          ) {
            totalCount
          }
          stakedSuppliersByBlockAndServices(
            filter: {block: {timestamp: {greaterThanOrEqualTo:$endCurrentAndStartPrevious, lessThan: $startCurrent}}}
          ) {
            totalCount
            aggregates {
              sum {
                amount
              }
            }
          }
        }
      }
    }
  }
`)

export const getServicesPerformanceVariables = (currentDate: Date | string, timeSelected: string): ExtractVariables<typeof servicesPerformanceDocument> => {
  let timeSelectedToUse = Time.Last30d

  if (timeSelected && Object.values(Time).includes(timeSelected as Time)) {
    timeSelectedToUse = timeSelected as Time
  }

  const startCurrent = new Date(currentDate)

  let endCurrentAndStartPrevious: Date, endPrevious: Date

  switch (timeSelectedToUse) {
    case Time.Last24h: {
      endCurrentAndStartPrevious = addHoursToUtc(startCurrent, -23)
      endPrevious = addHoursToUtc(endCurrentAndStartPrevious, -23)
      break
    }
    case Time.Last7d: {
      endCurrentAndStartPrevious = addDaysToUtc(startCurrent, -6)
      endPrevious = addDaysToUtc(endCurrentAndStartPrevious, -6)
      break
    }
    case Time.Last30d: {
      endCurrentAndStartPrevious = addDaysToUtc(startCurrent, -29)
      endPrevious = addDaysToUtc(endCurrentAndStartPrevious, -29)
      break
    }
    case Time.Last90d: {
      endCurrentAndStartPrevious = addDaysToUtc(startCurrent, -89)
      endPrevious = addDaysToUtc(endCurrentAndStartPrevious, -89)
      break
    }
  }

  return {
    startCurrent: startCurrent.toISOString(),
    endCurrentAndStartPrevious: endCurrentAndStartPrevious.toISOString(),
    endPrevious: endPrevious.toISOString()
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

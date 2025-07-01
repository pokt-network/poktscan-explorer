import { graphql } from '@/app/config/gql'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { Time } from '@/app/dashboards/services/constants'
import {
  addDaysToUtc,
  addHoursToUtc,
  getUtcEndOfDay,
  getUtcEndOfHour,
  getUtcStartOfDay,
  getUtcStartOfHour,
} from '@/app/Charts/utils'

export const rewardsByAddressAndTimeGroupByDateDocument = graphql(`
  query getRewardsByAddressesAndTimeGroupByAddressAndDate($addresses: [String!]!, $startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    rewards: getRewardsByAddressesAndTimeGroupByAddressAndDate(
      addresses: $addresses, 
      startDate: $startDate, 
      endDate: $endDate, 
      truncInterval: $truncInterval
    )
  }
`)

export function getValidSelectedTime(time: string): Time {
  let timeSelectedToUse = Time.Last7d

  if (time && Object.values(Time).includes(time as Time)) {
    timeSelectedToUse = time as Time
  }

  return timeSelectedToUse === Time.Last90d ? Time.Last7d : timeSelectedToUse
}

export function rewardsByAddressAndTimeGroupByDateVariables(
  addresses: Array<string>,
  currentDate: Date | string,
  timeSelected: string
): ExtractVariables<typeof rewardsByAddressAndTimeGroupByDateDocument> {
  const timeSelectedToUse = getValidSelectedTime(timeSelected)

  let startDate: Date

  switch (timeSelectedToUse) {
    case Time.Last24h: {
      startDate = getUtcStartOfHour(addHoursToUtc(currentDate, -23))
      break
    }
    case Time.Last7d: {
      startDate = getUtcStartOfDay(addDaysToUtc(currentDate, -6))
      break
    }
    case Time.Last30d: {
      startDate = getUtcStartOfDay(addDaysToUtc(currentDate, -29))
      break
    }
    default: {
      throw new Error('Invalid time selected')
    }
  }

  const date = new Date(currentDate)

  return {
    addresses,
    startDate: startDate.toISOString(),
    endDate: (timeSelectedToUse === Time.Last24h ? getUtcEndOfHour : getUtcEndOfDay)(date).toISOString(),
    truncInterval: timeSelectedToUse === Time.Last24h ? 'hour' : 'day'
  }
}

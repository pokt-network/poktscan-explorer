import { graphql } from '@/app/config/gql'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/app/utils/dates'

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

export function rewardsByAddressAndTimeGroupByDateVariables(
  addresses: Array<string>,
  dateStr: string,
  timeSelected: string
): ExtractVariables<typeof rewardsByAddressAndTimeGroupByDateDocument> {
  const {end, truncInterval, start} = getStartAndEndDateBasedOnTime(dateStr, timeSelected, true)

  return {
    addresses,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}

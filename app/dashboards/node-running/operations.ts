import { graphql } from '@/app/config/gql'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/app/utils/dates'

export const claimProofByTimesDocument = graphql(`
  query claimProofDataByTime(
    $startDate: Datetime!
    $endDate: Datetime!
    $truncInterval: String!
  ) {
    data: getClaimProofsDataByTime(
      startTs: $startDate,
      endTs: $endDate,
      truncInterval: $truncInterval
    )
  }
`)

export const claimProofByTimesVariables = (
  dateStr: string,
  timeSelected: string
): ExtractVariables<typeof claimProofByTimesDocument> => {
  const { start, end, truncInterval } = getStartAndEndDateBasedOnTime(
    dateStr,
    timeSelected
  )

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}

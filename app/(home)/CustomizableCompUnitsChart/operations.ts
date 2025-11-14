import type { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/app/utils/dates'
import { gql } from '@apollo/client'

export const customizableCompUnitsDocument = gql`
  query customizableCompUnits($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    groupByDay: getRewardsByDate(
      startDate: $startDate,
      endDate: $endDate,
      truncInterval: $truncInterval,
    )
  }
`

export function customizableCompUnitsVariables(
  currentDate: string,
  selectedTime: string
): ExtractVariables<typeof customizableCompUnitsDocument> {
  const {start, end, truncInterval} = getStartAndEndDateBasedOnTime(currentDate, selectedTime)

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    truncInterval,
  }
}

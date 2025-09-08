import type { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { getStartAndEndDateBasedOnTime } from '@/app/utils/dates'
import { graphql } from '@/app/config/gql'

export const customizableCompUnitsDocument = graphql(`
  query customizableCompUnits($startDate: Datetime!, $endDate: Datetime!, $truncInterval: String!) {
    groupByDay: getRewardsByDate(
      startDate: $startDate,
      endDate: $endDate,
      truncInterval: $truncInterval,
    )
  }
`)

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

import { gql } from '@apollo/client'
import { StakeStatus, SupplierFilter } from '@/app/config/gql/graphql'
import { ExtractVariables } from '@/app/hooks/useFetchOnBlock'
import { addHoursToUtc, getDateFromIsoString } from '@/app/Charts/utils'

export const summaryDocument = gql`
  query nodesSummary(
    $filter: SupplierFilter!,
    $addresses: [String!]!,
    $currentDate: Datetime!,
    $last24Hours: Datetime!,
    $last48Hours: Datetime!
  ) {
    suppliers(
      filter: $filter
    ) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    last24h: getRewardsByAddressesAndTime(
      addresses: $addresses,
      startDate: $last24Hours,
      endDate: $currentDate,
    )

    last48h: getRewardsByAddressesAndTime(
      addresses: $addresses,
      startDate: $last48Hours,
      endDate: $currentDate,
    )
  }
`

export const summaryVariables = (
  filterForOwners: boolean,
  addresses: Array<string>,
  dateStr: string,
): ExtractVariables<typeof summaryDocument> => {
  const date = getDateFromIsoString(dateStr)

  const addressesFilter: SupplierFilter = filterForOwners ? {
    ownerId: {
      in: addresses
    }
  } : {
    serviceConfigs: {
      some: {
        or: addresses.map(address => ({
          revShare: {
            contains: [{ address }]
          }
        }))
      }
    }
  }

  return {
    filter: {
      stakeStatus: {
        equalTo: StakeStatus.Staked
      },
      ...addressesFilter,
    },
    currentDate: date.toISOString(),
    last24Hours: addHoursToUtc(date, -24).toISOString(),
    last48Hours: addHoursToUtc(date, -48).toISOString(),
    addresses: addresses,
  }
}
